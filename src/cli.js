const commander = require('commander');
const Repl = require('./repl');

commander
    .option(
        '-c --credentials <credentials>',
        'Path to your Firebase credentials file'
    )
    .option('-u --url <databaseUrl>', 'URL of your Firebase DB')
    .option('-a --auth <auth>', 'Auth variable override')
    .parse(process.argv);

const { credentials, url, auth } = commander;

const repl = new Repl({
    credentials,
    url,
    auth,
});

repl.showPrompt();
