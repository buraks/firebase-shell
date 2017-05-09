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
        'SELECT foo,bar,baz/bop FROM stuff',
        {
            fields: ['foo', 'bar', 'baz/bop'],
            limit: null,
            path: 'stuff',
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
        'SELECT foo/bar FROM baz/bop LIMIT -10',
        {
            fields: ['foo/bar'],
            limit: -10,
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
    [
        'SELECT * FROM customers WHERE name = "Harry"',
        {
            fields: '*',
            limit: null,
            path: 'customers',
            where: {
                path: 'name',
                operator: '=',
                value: 'Harry',
            },
        },
    ],
    [
        "SELECT * FROM customers WHERE name = 'Harry'",
        {
            fields: '*',
            limit: null,
            path: 'customers',
            where: {
                path: 'name',
                operator: '=',
                value: 'Harry',
            },
        },
    ],
    [
        'SELECT * FROM customers WHERE hobby = null',
        {
            fields: '*',
            limit: null,
            path: 'customers',
            where: {
                path: 'hobby',
                operator: '=',
                value: null,
            },
        },
    ],
    [
        'SELECT * FROM customers WHERE isActive = false',
        {
            fields: '*',
            limit: null,
            path: 'customers',
            where: {
                path: 'isActive',
                operator: '=',
                value: false,
            },
        },
    ],
    [
        'SELECT * FROM customers WHERE isActive = true',
        {
            fields: '*',
            limit: null,
            path: 'customers',
            where: {
                path: 'isActive',
                operator: '=',
                value: true,
            },
        },
    ],
    [
        'SELECT []/name FROM customers',
        {
            fields: ['[]/name'],
            limit: null,
            path: 'customers',
            where: null,
        },
    ],
].forEach(([query, result]) => {
    test(`Parsing query: ${query}`, () => {
        expect(parser.parse(query)).toEqual(result);
    });
});

[
    [
        'foo',
        'Expected "select" but "f" found.',
        {
            column: 1,
            line: 1,
            offset: 0,
        },
        {
            column: 2,
            line: 1,
            offset: 1,
        },
    ],
    [
        'select wiggle',
        'Expected " ", ",", "/", or [^.$#[\\]/ ,] but end of input found.',
        {
            column: 14,
            line: 1,
            offset: 13,
        },
        {
            column: 14,
            line: 1,
            offset: 13,
        },
    ],
    [
        'select wiggle from not$a$valid$path',
        'Expected " ", "/", "limit", "where", [^.$#[\\]/ ,], or end of input but "$" found.',
        {
            column: 23,
            line: 1,
            offset: 22,
        },
        {
            column: 24,
            line: 1,
            offset: 23,
        },
    ],
    [
        'select bob from bill where tool ~ hammer',
        'Expected " ", "<=", "=", "==", or ">=" but "~" found.',
        {
            column: 33,
            line: 1,
            offset: 32,
        },
        {
            column: 34,
            line: 1,
            offset: 33,
        },
    ],
].forEach(([query, message, start, end]) => {
    test(`Parsing error: ${query}`, () => {
        try {
            parser.parse(query);
        } catch (e) {
            expect(e.message).toBe(message);
            expect(e.location.start).toEqual(start);
            expect(e.location.end).toEqual(end);
        }
    });
});
