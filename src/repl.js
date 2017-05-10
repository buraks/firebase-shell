const inquirer = require('inquirer');
const Rx = require('rx');
const parser = require('./parser');
const query = require('./query');
const printer = require('./printer');

class Repl {
    constructor({ credentials, url, auth, output = 'table' }) {
        this.credentials = credentials;
        this.auth = auth;
        this.url = url;
        this.output = output;
        this.prompts = new Rx.Subject();
        this.inquirer = inquirer.prompt(this.prompts);
        this.inquirer.ui.process.subscribe(this.onSubmit.bind(this));
    }

    onSubmit(event) {
        const queryOptions = {
            credentials: this.credentials,
            auth: this.auth,
            url: this.url,
            query: event.answer.query,
        };

        return query
            .run(queryOptions)
            .then(printer[this.output])
            .catch(e => {
                console.log('Error running query', e);
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
