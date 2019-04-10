/*
Given a list of strings, return the count of the number of
strings where the string length is 2 or more and the first
and last chars of the string are the same.

['abc', 'aa', 'bb'] yields 2
*/
export function matchEnds(words) {
  let count = 0;
  words.forEach(word => {
    const length = word.length;
    if (length >= 2 && word[0] === word[length - 1]) {
      count += 1;
    }
  });
  return count
}

/*
Given an array of numbers, return new array where
first element is diffrence between maximum and minimum of passed array
last element is sum of minimum and maximum
and passed array in center
[1, 2, 3] yields [2, 1, 2, 3, 4]
[5, 2, 14] yields [12, 5, 2, 14, 16]
*/
export function addFirstAndLast(numbers) {
  const max = numbers.reduce((a,b)=> Math.max(a,b));
  const min = numbers.reduce((a,b)=> Math.min(a,b));
  const diff = max - min;
  const sum = max + min;
  return [diff].concat(numbers).concat(sum);
}

/*
Given a list of strings, return a list with the strings
in sorted order, except group all the strings that begin with 'x' first.
e.g. ['mix', 'xyz', 'apple', 'xanadu', 'aardvark'] yields
['xanadu', 'xyz', 'aardvark', 'apple', 'mix']
Hint: this can be done by making 2 lists and sorting each of them
before combining them.
*/
export function xLetterFirst(words) {
  const obj = words.reduce(
    (acc, word) => {
      if (word.startsWith("x")) {
        acc.x.push(word);
      } else {
        acc.notx.push(word);
      }
      return acc;
    },
    { x: [], notx: [] }
  );
  return obj.x.sort().concat(obj.notx.sort());
}

/*
Given a list of non-empty arrays, return a list sorted in increasing
order by the last element in each tuple.
e.g. [[1, 7], [1, 3], [3, 4, 5], [2, 2]] yields
[[2, 2], [1, 3], [3, 4, 5], [1, 7]]
*/
export function sortByLast(nestedArrays) {
  return nestedArrays.sort((arr1, arr2) => {
    return arr1[arr1.length - 1] - arr2[arr2.length - 1]
  })
}
