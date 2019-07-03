/* eslint-disable no-use-before-define */
/* eslint-disable func-style */
/* eslint-disable complexity */
/* eslint-disable valid-jsdoc */
/* eslint-disable filenames/match-regex */
/**
 * Реализовать функцию cloneDeep которая копирует объекты по значению с любой глубиной вложенности
 */
export default function cloneDeep(source) {
  if (source === null || typeof source !== 'object') {
    return source;
  }

  let destination = {};

  // Array
  if (Array.isArray(source)) {
    destination = source.map(value => cloneDeep(value));
  }

  // other objects
  else {
    const tag = Object.prototype.toString.call(source);

    switch (tag) {
      // Map
      case '[object Map]':
        destination = cloneDeepMap(source, cloneDeep);
        break;

      // Set
      case '[object Set]':
        destination = cloneDeepSet(source, cloneDeep);
        break;

      // String | Boolean | Number | Data
      case '[object String]':
      case '[object Boolean]':
      case '[object Number]':
      case '[object Date]':
        destination = new source.constructor(source.valueOf());
        break;

      default:
        // return source for other `non-plain` objects
        if (Object.getPrototypeOf(source) !== Object.prototype) {
          return source;
        }
    }
  }

  // clone own enumerable properties of the object source
  for (const prop in source) {
    if (source.hasOwnProperty(prop)) {
      destination[prop] = cloneDeep(source[prop]);
    }
  }

  return destination;
}

function cloneDeepMap(source, cloner) {
  const destination = new Map();
  for (const [key, value] of source) {
    destination.set(cloner(key), cloner(value));
  }
  return destination;
}

function cloneDeepSet(source, cloner) {
  const destination = new Set();
  for (const value of source) {
    destination.add(cloner(value));
  }
  return destination;
}
