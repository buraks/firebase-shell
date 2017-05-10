#!/usr/bin/env node

const fs = require('fs');
const commander = require('commander');
const chalk = require('chalk');
const Repl = require('./repl');
const { run } = require('./query');
const parser = require('./parser');
const printer = require('./printer');

commander
    .option(
        '-c --credentials <credentials>',
        'Path to your Firebase credentials file',
        process.env.GOOGLE_APPLICATION_CREDENTIALS
    )
    .option('-u --url <databaseUrl>', 'URL of your Firebase database')
    .option('-a --auth <auth>', 'Auth uid variable override')
    .option(
        '-o --output <output>',
        'The format to use when outputing results. Options are table, json, and jsonPretty. Defaults to table.',
        'table'
    )
    .option(
        '-q --query <query>',
        'An optional query to run. If provided the result will be send to stdout and the program will be exited.'
    )
    .parse(process.argv);

const { credentials, url, auth, query, output } = commander;

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

if (typeof printer[output] !== 'function') {
    console.log(chalk.bold.red('Invalid output option.'));
    console.log('');
    console.log('Expected one of the following:');
    console.log(' - table');
    console.log(' - json');
    console.log(' - jsonPretty');
    console.log('');
    console.log(`But ${chalk.bold(output)} was provided.`);
    console.log('');
    process.exit(1);
}

if (query) {
    run({
        credentials,
        url,
        auth,
        query: parser.parse(query),
    }).then(printer[output]);
} else {
    const repl = new Repl({
        credentials,
        url,
        auth,
        output,
    });

    repl.showPrompt();
}
