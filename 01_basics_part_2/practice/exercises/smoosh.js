/**
 * Задача 1: написать функцию smoosh, которая принимает массив, "выравнивает" вложенные массивы
 * в одноуровневый массив и возвращает новый плоский массив.
 * Например:
 * smoosh([1, 2, [3, 4], 5])
 * > [1, 2, 3, 4, 5]
 * Входной массив может содержать массивы любого уровня вложенности.
 * Например: [[1, 2], [3, [4, [5]]]]
 *
 * Задача 2: написать функцию squeeze (по аналогии со smoosh) таким образом,
 * чтобы она модифицировала исходный массив, а не возвращала новый.
 *
 * Задача 3*: для функций smoosh и squeeze добавить валидацию входного параметра.
 * В случае, если на вход передан не массив функция должна выбросить исключение
 * с сообщением 'argument should be an array'.
 */

// all tests are ok

const isInputArrayValidator = fn => input => {
  if (!Array.isArray(input)) {
   throw new TypeError('argument should be an array');
  }
  return fn(input);
}

function smoosh(input) {
  return input.reduce((acc, current) => {
    Array.isArray(current)
      ? acc.push(...smoosh(current))
      : acc.push(current);
    return acc;
  }, []);
};

function squeeze(input) {
  return input.reduceRight((acc, current, index) => {
    if (Array.isArray(current)) {
      acc.splice(index, 1, ...squeeze(current));
    }
    return acc;
  }, input);
};

smoosh = isInputArrayValidator(smoosh);
squeeze = isInputArrayValidator(squeeze);

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#reduce_and_concat

export { smoosh, squeeze };
