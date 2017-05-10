const Table = require('cli-table');
const isPlainObject = require('lodash/isPlainObject');

function table(results) {
    const table = new Table({
        head: ['Key', 'Value'],
    });

    let resultsCount = 0;

    if (isPlainObject(results)) {
        Object.keys(results).forEach(key => {
            resultsCount += 1;
            table.push([key, JSON.stringify(results[key], null, 2)]);
        });
    }

    console.log(table.toString());
    console.log(`Results: ${resultsCount}`);
}

function json(results) {
    console.log(JSON.stringify(results));
}

function jsonPretty(results) {
    console.log(JSON.stringify(results, null, ' '));
}

module.exports = {
    table,
    json,
    jsonPretty,
};
