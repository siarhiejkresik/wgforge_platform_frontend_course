/* eslint-disable valid-jsdoc */
/* eslint-disable func-style */

/**
 * Задание: написать построитель SQL-запросов.
 * Данный модуль должен экспортировать функцию `query`, вызов которой должен возвращать новый экземпляр объекта query.
 * Например:
 * const q1 = query();
 * const q2 = query();
 * console.log(Object.is(q1, q2)) // false
 *
 * В качестве аргументов query может передаваться имя таблицы.
 * Тогда при дальнейшем составлении запроса вызовы метода from(tableName) игнорируются.
 *
 * У возвращаемого объекта должны быть следующие методы:
 *
 * select(arg1, arg2 ... argN) - может принимать список полей для выборки.
 * Аргументы должны иметь тип String. Если ни одного аргумента не передано должны быть получены все поля таблицы
 * Например:
 * q.select().from('users')
 * > SELECT * FROM users
 * q.select('id', 'name').from('users')
 * > SELECT id, name FROM users
 *
 * from(tableName: String) - указывает из какой таблицы получать данные.
 *
 * where(fieldName: String) - служит для задания условия фильтрации.
 * При множественном вызове метода where в одном запросе условия должны объединяться через логическое "И".
 * Метод where должен возвращать объект имеющий следующие методы:
 * orWhere(fieldName: String) - делает то же самое что where, но объединяет через "ИЛИ".
 * Метод where должен возвращать объект имеющий следующие методы:
 *
 * equals(value: any) - условие равенства
 * Например: SELECT * FROM student WHERE age = 42;
 *
 * in(values: array) - позволяет определить, совпадает ли значение объекта со значением в списке
 * Например: SELECT * FROM offices WHERE city IN ('Minsk', 'Nicosia', 'Seattle');
 *
 * gt(value: any) - условие больше '>'
 * gte(value: any) - условие больше или равно '>='
 * lt(value: any) -  условие меньше '<'
 * lte(value: any) -  условие меньше или равно '<='
 * between(from: any, to: any) -  условие нахождения значения поля в заданном диапазоне:
 * SELECT * FROM products WHERE price BETWEEN 4.95 AND 9.95;
 *
 * isNull() - условие отсутствия значения у поля
 *
 * not() - служит для задания противоположного.
 * После вызова not можно вызывать только те же методы, которые использует where для сравнения.
 *
 * q.select().from('users').where('name').not().equals('Vasya')
 *
 * Вызов not не может быть вызван более одного раза подряд:
 * q.select().from('users').where('name').not().not().equals('Vasya')
 *
 * Внимание: методы сравнения не могут быть вызваны до вызова метода where()!
 *
 * Получения строчного представления сконструированного SQL-запроса должно происходить при
 * вызове метода toString() у объекта query.
 * В конце строки SQL-запроса должен быть символ ';'
 *
 * Дополнительные задания:
 *
 * 1. Добавить в сигнатуру функии query второй опциональный аргумент options типа Object.
 * Если в options есть поле escapeNames со значением true, названия полей и таблиц должны быть обёрнуты в двойные кавычки:
 *
 * const q = query({escapeNames: true});
 * q.select('name').from('people').toString()
 * > SELECT "name" FROM "people";

 * const q = query('books', {escapeNames: true});
 * q.select('title').toString()
 * > SELECT "title" FROM "books";
 *
 * 2. Добавить возможность передавать в условия методов сравнения в качестве значения экземпляр запроса query.
 *
 * const q1 = query('users');
 * const admins = q1.select('id').where('role').equals('admin');
 * const q2 = query('posts');
 * const posts = q2.select().where('author_id').in(admins);
 * posts.toString();
 * > SELECT * FROM posts WHERE author_id IN (SELECT id FROM users WHERE role = 'admin');
 *
 * 3. Реализовать функциональность создания INSERT и DELETE запросов. Написать для них тесты.
 */

// constants

const SQL_LITERALS = {
  SELECT: 'SELECT',
  INSERT: 'INSERT',
  DELETE: 'DELETE',
  FROM: 'FROM',
  WHERE: 'WHERE',
  EQ_SIGN: '=',
  GT_SIGN: '>',
  GTE_SIGN: '>=',
  LT_SIGN: '<',
  LTE_SIGN: '<=',
  IN: 'IN',
  BETWEEN: 'BETWEEN',
  IS: 'IS',
  NULL: 'NULL',
  AND: 'AND',
  OR: 'OR',
  NOT: 'NOT',
  ALL_FIELDS_SIGN: '*',
  LEFT_PARENTHESIS: '(',
  RIGHT_PARENTHESIS: ')',
  SPACE: ' ',
  LIST_DELIMITER: ', ',
  QUERY_END_CHAR: ';'
};

const COMPARE_OPS_LITERALS = {
  equals: SQL_LITERALS.EQ_SIGN,
  gt: SQL_LITERALS.GT_SIGN,
  gte: SQL_LITERALS.GTE_SIGN,
  lt: SQL_LITERALS.LT_SIGN,
  lte: SQL_LITERALS.LTE_SIGN
};

const QUERY_STATES = {
  WHERE: 'where'
};

// formatters

const quoteIfString = quote => value => {
  if (typeof value === 'string' && value) {
    return `${quote}${value}${quote}`;
  }
  return value;
};

const singleQuoteIfString = quoteIfString("'");
const doubleQuoteIfString = quoteIfString('"');

// type validators

const validateString = value => {
  if (typeof value !== 'string') {
    throw new TypeError('argument must be strings');
  }
  return value;
};

const validateArray = value => {
  if (!Array.isArray(value)) {
    throw new TypeError('argument must be an array');
  }
  return value;
};

const validateStringArray = arr => {
  try {
    validateArray(arr);
    arr.forEach(value => {
      validateString(value);
    });
  } catch {
    throw new TypeError('argument must be an array of strings');
  }
  return arr;
};

// query

export default function query(...args) {
  let table;
  let fields = [];

  const whereClause = {
    state: null,
    stack: [],
    whereObj: null
  };

  // strange way to get arguments of a function with a strange signature
  //   query(tableName: String)
  //   query(options: Object)
  //   query(tableName: String, options: Object)
  table = args.find(arg => typeof arg === 'string') || '';
  const options = args.find(arg => typeof arg === 'object' && arg !== null) || {
    escapeNames: false
  };

  // query object

  const queryObj = {
    /**
     * select(arg1, arg2 ... argN) - может принимать список полей для выборки.
     * Аргументы должны иметь тип String. Если ни одного аргумента не передано должны быть получены все поля таблицы
     * Например:
     * q.select().from('users')
     * > SELECT * FROM users
     * q.select('id', 'name').from('users')
     * > SELECT id, name FROM users
     */
    select(...args) {
      validateStringArray(args);

      if (args.length === 0) {
        return this;
      }
      fields = args;
      return this;
    },

    /**
     * from(tableName: String) - указывает из какой таблицы получать данные.
     */
    from(tableName) {
      validateString(tableName);

      if (table) {
        return this;
      }
      table = tableName;
      return this;
    },

    /**
     * where(fieldName: String) - служит для задания условия фильтрации.
     * При множественном вызове метода where в одном запросе условия должны объединяться через логическое "И".
     */
    where(fieldName) {
      return where({ whereClause, queryObj }, fieldName, SQL_LITERALS.AND);
    },

    /**
     * orWhere(fieldName: String) - делает то же самое что where, но объединяет через "ИЛИ".
     */
    orWhere(fieldName) {
      return where({ whereClause, queryObj }, fieldName, SQL_LITERALS.OR);
    },

    toString() {
      const { escapeNames } = options;
      const queryStack = [];

      // SELECT
      queryStack.push(SQL_LITERALS.SELECT);

      // FIELDS
      let queryFields;
      if (fields.length) {
        queryFields = escapeNames ? fields.map(doubleQuoteIfString) : fields;
      } else {
        queryFields = [SQL_LITERALS.ALL_FIELDS_SIGN];
      }
      queryStack.push(queryFields.join(SQL_LITERALS.LIST_DELIMITER));

      // FROM
      queryStack.push(SQL_LITERALS.FROM);
      queryStack.push(escapeNames ? doubleQuoteIfString(table) : table);

      // WHERE
      if (whereClause.stack.length) {
        queryStack.push(whereClause.stack.join(SQL_LITERALS.SPACE));
      }

      // stringify queryStack
      const q = queryStack.join(SQL_LITERALS.SPACE);

      return `${q}${SQL_LITERALS.QUERY_END_CHAR}`;
    }
  };
  return queryObj;
}

// where

function where({ whereClause, queryObj }, fieldName, literal) {
  validateString(fieldName);

  // push WHERE | AND | OR on whereClause stack
  if (whereClause.state === QUERY_STATES.WHERE) {
    whereClause.stack.push(literal);
  } else {
    whereClause.stack.push(SQL_LITERALS.WHERE);
  }

  whereClause.stack.push(fieldName);
  whereClause.state = QUERY_STATES.WHERE;

  let notIsCalledOnce = false;

  // don't create whereObj twice
  if (whereClause.whereObj) {
    return whereClause.whereObj;
  }

  // whereObj

  /**
   *  swap the last two stack elements if the last one is NOT;
   *  this function is needed because NOT can precede or follow a field name:
   *    WHERE NOT field >= 42
   *    WHERE field NOT IN (1, 2)
   *
   *  not reliable
   **/
  const swapIfNot = () => {
    if (notIsCalledOnce) {
      const not = whereClause.stack.pop();
      const beforeNot = whereClause.stack.pop();
      whereClause.stack.push(not);
      whereClause.stack.push(beforeNot);
    }
  };

  // construct comparison operations

  const buildCompareOp = op => value => {
    whereClause.stack.push(COMPARE_OPS_LITERALS[op]);
    whereClause.stack.push(singleQuoteIfString(value));
    return queryObj;
  };

  const compareOps = Object.keys(COMPARE_OPS_LITERALS).reduce((acc, op) => {
    const compareOp = buildCompareOp(op);
    const operation = (...args) => {
      swapIfNot();
      return compareOp(...args);
    };
    acc[op] = operation;
    return acc;
  }, {});

  //

  const whereObj = {
    /**
     * in(values: array) - позволяет определить, совпадает ли значение объекта со значением в списке
     * Например: SELECT * FROM offices WHERE city IN ('Minsk', 'Nicosia', 'Seattle');
     */
    in(values) {
      validateArray(values);

      const LEFT = SQL_LITERALS.LEFT_PARENTHESIS;
      const RIGHT = SQL_LITERALS.RIGHT_PARENTHESIS;

      const middle = values.map(singleQuoteIfString).join(SQL_LITERALS.LIST_DELIMITER);

      whereClause.stack.push(SQL_LITERALS.IN);
      whereClause.stack.push(`${LEFT}${middle}${RIGHT}`);

      return queryObj;
    },

    /**
     * between(from: any, to: any) -  условие нахождения значения поля в заданном диапазоне:
     * SELECT * FROM products WHERE price BETWEEN 4.95 AND 9.95;
     */
    between(from, to) {
      whereClause.stack.push(SQL_LITERALS.BETWEEN);
      whereClause.stack.push(singleQuoteIfString(from));
      whereClause.stack.push(SQL_LITERALS.AND);
      whereClause.stack.push(singleQuoteIfString(to));

      return queryObj;
    },

    /**
     * isNull() - условие отсутствия значения у поля
     */
    isNull() {
      if (notIsCalledOnce) {
        // insert IS before NOT
        const not = whereClause.stack.pop();
        whereClause.stack.push(SQL_LITERALS.IS);
        whereClause.stack.push(not);
      } else {
        whereClause.stack.push(SQL_LITERALS.IS);
      }

      whereClause.stack.push(SQL_LITERALS.NULL);

      return queryObj;
    },

    /**
     * not() - служит для задания противоположного.
     * После вызова not можно вызывать только те же методы, которые использует where для сравнения.
     *
     * q.select().from('users').where('name').not().equals('Vasya')
     *
     * Вызов not не может быть вызван более одного раза подряд:
     * q.select().from('users').where('name').not().not().equals('Vasya')
     */
    not() {
      if (notIsCalledOnce) {
        throw new Error("not() can't be called multiple times in a row");
      }

      whereClause.stack.push(SQL_LITERALS.NOT);

      notIsCalledOnce = true;

      return whereObj;
    }
  };
  Object.assign(whereObj, compareOps);
  return whereObj;
}
