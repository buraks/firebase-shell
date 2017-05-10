<div><img height="141" src="https://cloud.githubusercontent.com/assets/1671025/25864392/31541d12-34e7-11e7-9bed-aec2c1a2ef5d.png" /></div>

# Firebase Shell
[![Build Status](https://img.shields.io/travis/echo-health/firebase-shell/master.svg?style=flat)](https://travis-ci.org/echo-health/firebase-shell) [![npm version](https://img.shields.io/npm/v/firebase-shell.svg?style=flat)](https://www.npmjs.com/package/firebase-shell)

A Node.js command line tool for executing queries against a Firebase database using an SQL-like syntax.

## Why?

The Firebase UI console is great if you know the exact path of the data you want to view, but it doesn't provide any way to run a query against your data. The Firebase SDK has a nice API but if you want to query some data on the command line then you end up writing a non-trivial amount of code.

This tool aims to make it easy to query your Firebase data from the command line.

#### TLDR
```
$ select * from customers

┌──────────────────────┬────────────────────────────┐
│ Key                  │ Value                      │
├──────────────────────┼────────────────────────────┤
│ bsttRb+xm220Ig==     │ {                          │
│                      │   "name": "Sally",         │
│                      │   "age": 16,               │
│                      │ }                          │
├-─────────────────────┼────────────────────────────┤
│ HbJxvi0hUYIGpw==     │ {                          │
│                      │   "name": "Barry",         │
│                      │   "age": 31,               │
│                      │ }                          │
└──────────────────────┴────────────────────────────┘
Results: 2
```

## Installing
**firebase-shell** can be installed locally or globally, whatever you prefer.

### Global
```
$ npm install firebase-shell -g
$ firebase-shell -c path/to/credentials.json
```

### Local
```
npm install firebase-shell
./node_modules/.bin/firebase-shell --credentils my-credentials.json
```

You could also add an entry to the `scripts` section of your package.json allowing you to use `npm run` to open a shell. For example:

```
{
    "scripts": {
        "fbs": "firebase-shell --credentials path/to/credentials.json"
    }
}
```

### CLI Options
At minimum you need to provide a path to a credentials file for your Firebase database. This can be provided in the `--credentials` option or via the [`GOOGLE_APPLICATION_CREDENTIALS`](https://developers.google.com/identity/protocols/application-default-credentials) environment variable.

If you don't provide a value for the `--url` option then the project id will be extracted from the credentials file and the following url will be used.`https://${PROJECT_ID}.firebaseio.com/`. I _think_ that this should be ok for most projects.

You can see all options by using `--help`:

```
$ firebase-shell --help

  Usage: firebase-shell [options]

  Options:

    -h, --help                      output usage information
    -c --credentials <credentials>  Path to your Firebase credentials file
    -u --url <databaseUrl>          URL of your Firebase database
    -a --auth <auth>                Auth uid variable override
    -o --output <output>            The format to use when outputing results. Options are table, json, and jsonPretty. Defaults to table.
    -q --query <query>              An optional query to run. If provided the result will be send to stdout and the program will be exited.
```

#### `--auth`
The value of the `--auth` option (if provided) will be used for the `uid` property of the [`databaseAuthVariableOverride`](https://firebase.google.com/docs/reference/admin/node/admin.app.AppOptions#databaseAuthVariableOverride) option. So `--auth admin` would result in the app being initialized in the following way:

```
const admin = firebase.initializeApp({
    databaseAuthVariableOverride: {
        uid: 'admin',
    },
})
```

#### Pipeing output into another program
One use case might be to pipe the results of your query into another program, for example [`jq`](https://stedolan.github.io/jq/). You can acheive this by using the `--query` and `--output` options. For example:

```
$ firebase-shell --query 'select * from customers where age >= 18' --output json | jq '..|.name?|strings'
"Harry"
"Barry"
```

## Running Queries
The following examples assume a database containing this data.

```json
{
    "customers": {
        "A2103LLk1q04rA==": {
            "name": "Sally",
            "age": 16
        },
        "bsttRb+xm220Ig==": {
            "name": "Harry",
            "age": 20
        },
        "HbJxvi0hUYIGpw==": {
            "name": "Barry",
            "age": 31
        }
    }
}
```

For a good example of how **firebase-shell** makes it easy to query your data let's start with the following query.

```
$ select * from customers where age >= 18 limit 10
```

Which is equivalent to the following code.

```js
admin
    .database()
    .ref('customers')
    .orderByChild('age')
    .startsAt(18)
    .limitToFirst(10)
    .on('value')
    .then(snapshot => {
        console.log(snapshot.val());
    });
```

The output of the query would look something like this:

```
┌──────────────────────┬────────────────────────────┐
│ Key                  │ Value                      │
├──────────────────────┼────────────────────────────┤
│ bsttRb+xm220Ig==     │ {                          │
│                      │   "name": "Harry",         │
│                      │   "age": 20,               │
│                      │ }                          │
├-─────────────────────┼────────────────────────────┤
│ HbJxvi0hUYIGpw==     │ {                          │
│                      │   "name": "Barry",         │
│                      │   "age": 31,               │
│                      │ }                          │
└──────────────────────┴────────────────────────────┘
Results: 2
```

### `SELECT <fields...>`

You can easily imagine a situation where each customer object starts to get quite big as more fields are added. If you only want to see certain fields you can filter the resulting data by providing a comma-separated list of paths. In this example we actually don't know what the first part of the path will be as the keys are auto-generated uid's for each customer, but this is ok as you can make sections of a path match any key by using `[]`.

```
$ select []/name from customers

┌──────────────────────┬────────────────────────────┐
│ Key                  │ Value                      │
├──────────────────────┼────────────────────────────┤
│ A2103LLk1q04rA==     │ {                          │
│                      │   "name": "Sally",         │
│                      │ }                          │
├-─────────────────────┼────────────────────────────┤
│ bsttRb+xm220Ig==     │ {                          │
│                      │   "name": "Harry",         │
│                      │ }                          │
├-─────────────────────┼────────────────────────────┤
│ HbJxvi0hUYIGpw==     │ {                          │
│                      │   "name": "Barry",         │
│                      │ }                          │
└──────────────────────┴────────────────────────────┘
Results: 2
```

`SELECT` accepts a comma-separated list of these paths. A path can contain multiple match-all (`[]`) sections.

The reason for using `[]` as the way of specifying a "match-all" part of a path is that Firebase doesn't allow `[` or `]` characters in keys, so there can never be a real key that is `[]`.

### `FROM <path>`

This is probably the simplest clause. The `path` value is used to create the root [`Reference`](https://firebase.google.com/docs/reference/admin/node/admin.database.Reference) that all subsequent operations will be performed against.

### `WHERE <path> <operator> <value>`

A `WHERE` clause will cause an `orderByChild` operation on the query using the given `path`. Possible operators are:

Operator     | Method
------------ | -------------
`=` or `==`  | [`equalTo`](https://firebase.google.com/docs/reference/admin/node/admin.database.Reference#equalTo)
`<=`         | [`startAt`](https://firebase.google.com/docs/reference/admin/node/admin.database.Reference#startAt)
`>=`         | [`endAt`](https://firebase.google.com/docs/reference/admin/node/admin.database.Reference#endAt)

The `value` can be a string literal (using single or double quotes), a number, `true`, `false`, or `null`.

### `LIMIT <count>`

A `LIMIT` clause will cause a [`limitToFirst`](https://firebase.google.com/docs/reference/admin/node/admin.database.Reference#limitToFirst) or [`limitToLast`](https://firebase.google.com/docs/reference/admin/node/admin.database.Reference#limitToLast) operation on the query depending on whether `count` is a positive negative number. For example `LIMIT 5` would result in `.limitToFirst(5)` being called on the query whereas `LIMIT -5` would result in `.limitToLast(5)` being used.