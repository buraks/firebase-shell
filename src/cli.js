#!/usr/bin/env node

const fs = require('fs');
const commander = require('commander');
const chalk = require('chalk');
const Repl = require('./repl');

commander
    .option(
        '-c --credentials <credentials>',
        'Path to your Firebase credentials file',
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    )
    .option('-u --url <databaseUrl>', 'URL of your Firebase database')
    .option('-a --auth <auth>', 'Auth uid variable override')
    .parse(process.argv);

const { credentials, url, auth } = commander;

try {
    if (!fs.statSync(credentials).isFile()) {
        throw new Error();
    }
} catch (e) {
    console.log(chalk.bold.red('You must provide valid Firebase credentials.'));
    console.log('');
    console.log(
        chalk.yellow(
            'This can be done by either setting the --credentials,-c option or by setting the GOOGLE_APPLICATION_CREDENTIALS environment variable.'
        )
    );
    console.log('');
    process.exit(1);
}

const repl = new Repl({
    credentials,
    url,
    auth,
});

repl.showPrompt();
