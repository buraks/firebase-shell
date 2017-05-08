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
        if (!limit) {
            return ref;
        }
        return ref.limitToFirst(limit);
    };
}

const queryChainMethods = [getReference, applyLimit, applyWhere];

function pickFields({ fields }) {
    return snapshot => {
        if (!snapshot.exists()) {
            return null;
        }

        const value = snapshot.val();

        if (!isPlainObject(value) || !Array.isArray(fields)) {
            return value;
        }

        return Object.keys(value).reduce((result, key) => {
            const filteredValue = pick(
                value[key],
                fields.map(x => x.replace(/\//g, '.'))
            );
            return Object.assign(result, {
                [key]: filteredValue,
            });
        }, {});
    };
}

function run(options) {
    const appOptions = buildAppOptions(options);
    const app = firebase.initializeApp(appOptions, 'firebase-shell');

    const { query } = options;
    const queryChain = flow(queryChainMethods.map(x => x(query)));

    return queryChain(app)
        .once('value')
        .then(snapshot => app.delete().then(() => snapshot))
        .then(pickFields(query));
}

module.exports = run;
