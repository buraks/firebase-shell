Query =
    fields:SelectStatement
    Whitespace
    path: FromStatement
    Whitespace?
    where:WhereStatement?
    Whitespace?
    limit:LimitStatement?
    Whitespace? {
        return {
            fields,
            path,
            limit,
            where
        };
    }

SelectStatement =
    KeywordSelect
    Whitespace
    fields:Fields {
      return fields;
  }

FromStatement =
    KeywordFrom
    Whitespace
    path:Path {
        return path;
    }

LimitStatement =
    KeywordLimit
    Whitespace
    limit:Number {
        return limit
    }

WhereStatement =
    KeywordWhere
    Whitespace
    path:Path
    Whitespace
    operator:Operator
    Whitespace
    value:LiteralValue {
        return {
            path,
            operator,
            value
        };
    }

KeywordSelect =
    "select"i

KeywordFrom =
    "from"i

KeywordLimit =
    "limit"i

KeywordWhere =
    "where"i

Fields =
    "*" /
    head:Path tail:(Whitespace? Comma Whitespace? Path)* {
        var result = [head];
        for (var i = 0; i < tail.length; i++) {
              result.push(tail[i][3]);
        }
        return result;
    }

Path =
    head:Key tail:(PathSeperator Key)* {
        let path = head;
        for (const p of tail) {
            path += '/' + p[1];
        }
        return path;
    }

Key =
    "[]" /
    k:[^\.\$#\[\]\/ ,]+ {
        return k.join('');
    }

PathSeperator =
    "/"

Comma =
    ","

Operator =
    "==" { return '='; } /
    ">=" /
    "<=" /
    "="

Whitespace =
    " "+

LiteralValue =
    Number /
    String /
    Boolean /
    Null

Number =
    minus:"-"? d:[0-9]+ {
        const value = Number(d.join(''));
        return minus ? -value : value;
    }

String =
    '"' chars:[^"]* '"' {
        return chars.join('');
    } /
    "'" chars:[^']* "'" {
        return chars.join('');
    }

Boolean =
    "true"i {
        return true;
    } /
    "false"i {
        return false;
    }

Null =
    "null"i {
        return null;
    }