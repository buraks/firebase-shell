const parser = require('../parser');

[
    [
        'select foo from bar',
        {
            fields: ['foo'],
            limit: null,
            path: 'bar',
            where: null,
        },
    ],
    [
        'SELECT foo FROM bar',
        {
            fields: ['foo'],
            limit: null,
            path: 'bar',
            where: null,
        },
    ],
    [
        'SELECT foo/bar FROM baz/bop',
        {
            fields: ['foo/bar'],
            limit: null,
            path: 'baz/bop',
            where: null,
        },
    ],
    [
        'SELECT foo/bar FROM baz/bop LIMIT 10',
        {
            fields: ['foo/bar'],
            limit: 10,
            path: 'baz/bop',
            where: null,
        },
    ],
    [
        'SELECT foo/bar FROM baz/bop WHERE someNumber = 42 LIMIT 10',
        {
            fields: ['foo/bar'],
            limit: 10,
            path: 'baz/bop',
            where: {
                path: 'someNumber',
                operator: '=',
                value: 42,
            },
        },
    ],
    [
        'SELECT name FROM customers/profile WHERE age >= 30',
        {
            fields: ['name'],
            limit: null,
            path: 'customers/profile',
            where: {
                path: 'age',
                operator: '>=',
                value: 30,
            },
        },
    ],
].forEach(([query, result]) => {
    test(`Parsing query: ${query}`, () => {
        expect(parser.parse(query)).toEqual(result);
    });
});
