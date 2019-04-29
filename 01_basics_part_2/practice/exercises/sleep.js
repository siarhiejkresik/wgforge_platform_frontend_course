/**
 * Задание: написать функцию sleep, которая приостанавливает работу потока на
 * время переданное в аргументе. Время задаётся в секундах с точностью до 1 сек.
 * Если передан не валидный аргумент функция должна сразу завершить своё
 * выполнение и вернуть undefined.
 */

// all tests are ok

export default function sleep(time) {
  if (!Number.isInteger(time) || time < 0) {
    return;
  }
  const stopTime = Date.now() + time * 1000;
  while (Date.now() < stopTime) {}
}

