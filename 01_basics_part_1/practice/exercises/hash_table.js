/* eslint-disable filenames/match-regex */
/**
 * Необходимо реализовать хеш-таблицу, в которой в значения можно записывать данные любого типа.
 * Ключом должна быть строка.
 */

function djs2HashSting(string) {
  let hash = 5381;
  for (const char of string) {
    hash = ((hash << 5) + hash) + char.charCodeAt(0);
  }
  return hash;
}

export default class HashTable {
  /**
   * в качестве "памяти" используем массив
   */
  constructor() {
    this.memory = []; // an array of buckets: [ ... , [ ... , [key,value], ... ], ... ]
    this.size = 100; // max size of buckets in a hashtable
  }

  /**
   * Хеширующая функция.
   * Принимает ключ (тип строка) и возвращает уникальный адрес.
   * hashKey('abc') =>  17263
   * hashKey('xyz') => 283902
   */

  hashKey(key) {
    const hash = djs2HashSting(key);
    return hash % this.size;
  }

  /**
   * Метод для получения данных из хеш-таблицы по ключу.
   */

  get(key) {
    const bucketIndex = this.hashKey(key);
    const bucket = this.memory[bucketIndex];

    if (!bucket) {
      return;
    }

    for (const [key_, value] of bucket) {
      if (key_ === key) {
        return value;
      }
    }
  }

  /**
   * Добавляем значение в таблицу с заданным ключом.
   */

  set(key, value) {
    const bucketIndex = this.hashKey(key);
    let bucket = this.memory[bucketIndex];

    if (!bucket) {
      bucket = [];
      this.memory[bucketIndex] = bucket;
    }

    bucket.push([key,value]);
  }

  /**
   * Функция удаления из хеш-таблицы.
   * Принимает ключ.
   */

  remove(key) {
    const bucketIndex = this.hashKey(key);
    const bucket = this.memory[bucketIndex];

    if (!bucket) {
      return false;
    }

    const dataIndex = bucket.find(([key_]) => key_ === key);
    if (dataIndex === undefined) {
      return false;
    }
    bucket.splice(dataIndex, 1);

    if (bucket.length === 0) {
      this.memory[bucketIndex] = undefined;
    }
    return true;
  }
}
