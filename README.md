![firebase-shell logo](https://cloud.githubusercontent.com/assets/1671025/25864392/31541d12-34e7-11e7-9bed-aec2c1a2ef5d.png)

# Firebase Shell
[![Build Status](https://img.shields.io/travis/echo-health/firebase-shell/master.svg?style=flat)](https://travis-ci.org/echo-health/firebase-shell) [![npm version](https://img.shields.io/npm/v/firebase-shell.svg?style=flat)](https://www.npmjs.com/package/firebase-shell)

A Node.js command line tool for executing queries against a Firebase database using an SQL-like syntax.

## Why?

The Firebase UI console is great if you know the exact path of the data you want to view, but it doesn't provide any way to run a query against your data. The Firebase SDK has a nice API but if you want to query some data on the command line then you end up writing a non-trivial amount of code.

This tool aims to make it easy to query your Firebase data from the command line.

## Installing
Can be installed locally or globally, whatever you prefer.

### Global
```
$ npm install firebase-shell -g
$ firebase-shell -c path/to/credentials.json
```

### Local
```
npm install firebase-shell
```

Then add an entry to the `scripts` section of your package.json file that looks like this:

```
{
    "scripts": {
        "firebase-shell": "firebase-shell"
    }
}
```

Now you can run:

```
$ npm run firebase-shell -- --credentials path/to/credentials.json
```

### CLI Options
The only required option is `--credentials`, which should be the path to your credentials file for your Firebase database. You can see all options by using `--help`:

```
$ firebase-shell --help

  Usage: cli [options]

  Options:

    -h, --help                      output usage information
    -c --credentials <credentials>  Path to your Firebase credentials file
    -u --url <databaseUrl>          URL of your Firebase DB
    -a --auth <auth>                Auth uid variable override
```

The `--auth` option

## Running Queries
The following examples assume a database that looks like this:

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

A good example of how **firebase-shell** makes it easy to query your data is the following query.

```
$ select * from customers where age >= 18 limit 10
```

Which is equivalent to the following:

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

### Post-filtering

You can easily imagine a situation where each customer object starts to get quite big as more fields are added. If you only care about certain fields you can filter the resulting data by providing a comma-separated list of paths. In this example we actually don't know what the first part of the path will be as the keys are auto-generated uid's for each customer, but this is ok as you can make sections of a path match any key by using `[]`.

```
$ select []/name from customers where age >= 18

┌──────────────────────┬────────────────────────────┐
│ Key                  │ Value                      │
├──────────────────────┼────────────────────────────┤
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