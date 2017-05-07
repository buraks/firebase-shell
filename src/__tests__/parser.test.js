const parser = require('../parser');

test('it should foo', () => {
    expect(parser.parse('select foo from bar')).toEqual({
        fields: ['foo'],
        limit: null,
        path: 'bar',
        where: null,
    });
});