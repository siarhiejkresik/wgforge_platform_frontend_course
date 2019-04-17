/* eslint-disable func-style */
/* eslint-disable no-use-before-define */
/**
 * Реализовать метод deepMerge для рекурсивного слияния собственных и унаследованных перечислимых
 * строковых свойств исходного объекта в целевой объект.
 * Свойства исходного объекта, которые разрешаются в undefined, пропускаются,
 * если свойство существует в целевом объекте.
 * Свойства Array и plain Object типа рекурсивно объединяются, свойства других типов из исходного объекта
 * переписывают свойства в объекте назначения либо добавляются если их нету в объекте назначения
 *
 * Пример:
 *
 * const destinationObject = {
 *   students: [{ name: 'Unit 1' }, { name: 'Unit 2'}],
 *   label: 'backend',
 *   count: 1
 * };
 *
 * const sourceObject = {
 *  students: [{ surname: 'Forge 1' }, { surname: 'Forge 2'}],
 *  label: 'frontend'
 * };
 *
 * deepMerge(destinationObject, sourceObject);
 * // => {
 * //       students: [{ name: 'Unit 1', surname: 'Forge 1' }, { name: 'Unit 2', surname: 'Forge 2' }],
 * //       label: 'frontend',
 * //       count: 1
 * //    }
 */

// eslint-disable-next-line filenames/match-regex
export default function deepMerge(dst, src) {
  if (dst === src || !isMergeable(dst, src)) {
    return dst;
  }

  for (const prop in src) {
    const srcValue = src[prop];
    const dstValue = dst[prop];

    // Свойства исходного объекта, которые разрешаются в undefined,
    //  пропускаются если свойство существует в целевом объекте.
    if (srcValue === undefined && prop in dst) {
      continue;
    }

    // свойства Array и plain Object типа рекурсивно объединяются
    if (isMergeable(srcValue, dstValue)) {
      deepMerge(dst[prop], srcValue);
      continue;
    }

    // свойства других типов из исходного объекта переписывают свойства
    // в объекте назначения либо добавляются если их нету в объекте назначения
    dst[prop] = srcValue;
  }
  return dst;
}

// copied from redux
function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

function isArray(obj) {
  return Array.isArray(obj);
}

function isMergeableType(value) {
  return isArray(value) || isPlainObject(value);
}

function isMergeable(src, dst) {
  return isMergeableType(src) && isMergeableType(dst);
}
