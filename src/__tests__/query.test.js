const query = require('../query');

[
    [{ a: 1 }, '*', { a: 1 }],
    [
        {
            a: {
                b: 2,
                c: 3,
            },
        },
        ['a/b'],
        {
            a: {
                b: 2,
            },
        },
    ],
    [
        {
            a: {
                foo: 1,
                bar: 1,
            },
            b: {
                foo: 1,
                bar: 1,
            },
            c: {
                foo: 1,
                bar: 1,
            },
        },
        ['[]/foo'],
        {
            a: {
                foo: 1,
            },
            b: {
                foo: 1,
            },
            c: {
                foo: 1,
            },
        },
    ],
    [
        {
            a: {
                foo: 1,
                bar: 1,
            },
            b: {
                foo: 1,
                bar: 1,
            },
            c: {
                foo: 1,
                bar: 1,
            },
        },
        ['[]/[]/[]/[]/bar'],
        {},
    ],
].forEach(([value, fields, expected], i) => {
    test(`pickFields - ${i}`, () => {
        const snapshot = {
            exists() {
                return true;
            },
            val() {
                return value;
            },
        };
        expect(query.pickFields({ fields })(snapshot)).toEqual(expected);
    });
});
