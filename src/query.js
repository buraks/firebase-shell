const firebase = require('firebase-admin');
const pick = require('lodash/pick');
const flow = require('lodash/flow');
const isPlainObject = require('lodash/isPlainObject');

function buildAppOptions({ credentials, url, auth }) {
    const appOptions = {
        credential: firebase.credential.cert(credentials),
    };

    if (url) {
        appOptions.databaseURL = url;
    } else {
        appOptions.databaseURL = `https://${appOptions.credential.certificate_.projectId}.firebaseio.com/`;
    }

    if (auth) {
        appOptions.databaseAuthVariableOverride = {
            uid: auth,
        };
    }

    return appOptions;
}

function getReference({ path }) {
    return app => {
        return app.database().ref(path);
    };
}

function applyWhere({ where }) {
    return ref => {
        if (!where) {
            return ref;
        }

        const { path, operator, value } = where;

        ref = ref.orderByChild(path);

        switch (operator) {
            case '=':
                ref = ref.equalTo(value);
                break;
            case '>=':
                ref = ref.startAt(value);
                break;
            case '<=':
                ref = ref.endAt(value);
                break;
        }

        return ref;
    };
}

function applyLimit({ limit }) {
    return ref => {
        if (limit === null) {
            return ref;
        }
        if (limit >= 0) {
            return ref.limitToFirst(limit);
        }
        return ref.limitToLast(Math.abs(limit));
    };
}

function expandPath(obj, path, prefix = '') {
    const [key, ...rest] = path.split('/');

    return Object.keys(obj)
        .filter(k => k === key || key === '[]')
        .map(k => {
            const newPrefix = prefix ? `${prefix}/${k}` : k;

            if (rest.length === 0) {
                return newPrefix;
            }

            return expandPath(obj[k], rest.join('/'), newPrefix);
        })
        .reduce((flat, value) => {
            return [...flat, ...(Array.isArray(value) ? value : [value])];
        }, [])
        .filter(Boolean)
        .map(p => p.replace(/\//g, '.'));
}

function pickFields({ fields }) {
    return snapshot => {
        if (!snapshot.exists()) {
            return null;
        }

        const value = snapshot.val();

        if (!isPlainObject(value) || !Array.isArray(fields)) {
            return value;
        }

        const paths = fields.reduce((result, path) => {
            return [...result, ...expandPath(value, path)];
        }, []);

        return pick(value, paths);
    };
}

function run(options) {
    const appOptions = buildAppOptions(options);
    const app = firebase.initializeApp(appOptions, 'firebase-shell');

    const { query } = options;
    const buildQuery = flow(
        [getReference, applyLimit, applyWhere].map(x => x(query))
    );

    return buildQuery(app)
        .once('value')
        .then(snapshot => app.delete().then(() => snapshot))
        .then(pickFields(query));
}

module.exports = {
    buildAppOptions,
    pickFields,
    applyLimit,
    applyWhere,
    run,
};
