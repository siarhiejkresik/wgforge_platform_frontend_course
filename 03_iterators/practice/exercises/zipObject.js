/**
 * Реализовать функцию zipObject которая принимает два аргумента:
 *  - первый аргумент массив идентификаторов свойств объекта
 *  - второй аргумент массив значений свойств объекта
 * В качестве результата выполнения функция должна возвращать объект сформированный
 * из идентификаторов и значений полученных на входе
 *
 *
 * Пример:
 *  zipObject(['a', 'b'], [1, 2]);
 *  // => { 'a': 1, 'b': 2 }
 */
// eslint-disable-next-line filenames/match-regex
export default function zipObject(props, values) {
  const valuesCount = values.length;
  return props.reduce((acc, key, index) => {
    acc[key] = index < valuesCount ? values[index] : undefined;
    return acc;
  }, {});
}
