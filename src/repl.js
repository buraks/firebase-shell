const inquirer = require('inquirer');
const Table = require('cli-table');
const isPlainObject = require('lodash/isPlainObject');
const Rx = require('rx');
const parser = require('./parser');
const query = require('./query');

class Repl {
    constructor({ credentials, url, auth }) {
        this.credentials = credentials;
        this.auth = auth;
        this.url = url;
        this.prompts = new Rx.Subject();
        this.inquirer = inquirer.prompt(this.prompts);
        this.inquirer.ui.process.subscribe(this.onSubmit.bind(this));
    }

    onSubmit(event) {
        return query({
            credentials: this.credentials,
            auth: this.auth,
            url: this.url,
            query: event.answer.query,
        })
            .then(results => {
                const table = new Table({
                    head: ['Key', 'Value'],
                });

                let resultsCount = 0;

                if (isPlainObject(results)) {
                    Object.keys(results).forEach(key => {
                        resultsCount += 1;
                        table.push([
                            key,
                            JSON.stringify(results[key], null, 2),
                        ]);
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

    showPrompt() {
        this.prompts.onNext({
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
        });
    }
}

module.exports = Repl;
