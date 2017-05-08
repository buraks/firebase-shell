const inquirer = require('inquirer');
const Table = require('cli-table');
const isPlainObject = require('lodash/isPlainObject');
const parser = require('./parser');
const query = require('./query');

class Repl {
    constructor({ credentials, url, auth }) {
        this.credentials = credentials;
        this.auth = auth;
        this.url = url;
    }

    showPrompt() {
        return inquirer
            .prompt({
                name: 'command',
                message: '$',
                filter(value) {
                    const ast = parser.parse(value);
                    return {
                        query: parser.parse(value),
                        toString() {
                            return value;
                        },
                    };
                },
            })
            .then(answers => {
                return query({
                    credentials: this.credentials,
                    auth: this.auth,
                    url: this.url,
                    query: answers.command.query,
                });
            })
            .then(results => {
                const table = new Table();

                let resultsCount = 0;

                if (isPlainObject(results)) {
                    Object.keys(results).forEach(key => {
                        resultsCount += 1;
                        table.push({
                            [key]: JSON.stringify(results[key], null, 2),
                        });
                    });
                }

                console.log(table.toString());
                console.log(`Results: ${resultsCount}`);
            })
            .catch(e => {
                console.log('error', e);
            })
            .then(() => {
                process.nextTick(() => this.showPrompt());
            });
    }
}

module.exports = Repl;
