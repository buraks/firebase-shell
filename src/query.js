const firebase = require('firebase-admin');
const pick = require('lodash/pick');
const isPlainObject = require('lodash/isPlainObject');

function run(options) {
    const { credentials, url, auth, query } = options;

    const appOptions = {
        credential: firebase.credential.cert(credentials),
    };

    if (url) {
        appOptions.databaseURL = url;
    }

    if (auth) {
        appOptions.databaseAuthVariableOverride = {
            uid: auth,
        };
    }

    const app = firebase.initializeApp(appOptions, 'firebase-shell');
    const database = app.database();

    let ref = database.ref(query.path);

    if (query.limit) {
        ref = ref.limitToFirst(query.limit);
    }

    if (query.where) {
        const { path, operator, value } = query.where;

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
    }

    return ref
        .once('value')
        .then(snapshot => {
            return app.delete().then(() => snapshot);
        })
        .then(snapshot => {
            if (!snapshot.exists()) {
                return null;
            }

            const value = snapshot.val();

            if (!isPlainObject(value) || !Array.isArray(query.fields)) {
                return value;
            }

            return Object.keys(value).reduce((result, key) => {
                const filteredValue = pick(
                    value[key],
                    query.fields.map(x => x.replace(/\//g, '.'))
                );
                return Object.assign(result, {
                    [key]: filteredValue,
                });
            }, {});
        });
}

module.exports = run;
