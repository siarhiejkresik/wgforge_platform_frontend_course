/* eslint-disable filenames/match-regex */
import test from 'tape-catch';
import cloneDeep from '../exercises/cloneDeep';

const sourceObject = {
  forgeFrontend: {
    coaches: [{ name: 'Coache 1' }, { name: 'Coache 2' }],
    students: ['Student 1', 'Student 2']
  },
  forgeBackend: {
    coaches: ['Coache 1', 'Coache 2']
  },
  forgeMaintaince: [
    {
      part1: {
        students: ['Student 7', 'Student 8']
      }
    },
    {
      part2: {
        coaches: ['Coache 5', 'Coache 6']
      }
    }
  ]
};

test('cloneDeep', t => {
  t.equal(typeof cloneDeep, 'function');

  const clonedInstance = cloneDeep(sourceObject);

  t.test('clone deep objects by value', tt => {
    tt.equal(
      clonedInstance.forgeFrontend.coaches[0] === sourceObject.forgeFrontend.coaches[0],
      false
    );
    tt.equal(clonedInstance.forgeMaintaince[0] === sourceObject.forgeMaintaince[0], false);

    tt.deepEqual(sourceObject, clonedInstance, 'source and cloned should be equivalent');

    tt.end();
  });

  t.test('deep clone a map', tt => {
    const objKey = { c: 10 };

    const source = new Map();
    source.set('a', { x: 1 });
    source.set('b', 123);
    source.set(objKey, 'text');

    const cloned = cloneDeep(source);

    tt.deepEqual(source, cloned, 'should clone maps');
    tt.false(source === cloned, 'shouldn’t be the same object');
    tt.false(cloned.has(objKey), 'should clone map keys if objects');
    tt.false(source.get('a') === cloned.get('a'), 'should clone map values if objects');

    tt.end();
  });

  t.test('deep clone a set', tt => {
    const obj = { x: 1 };
    const source = new Set([1, 'qwe', obj]);
    const cloned = cloneDeep(source);

    tt.deepEqual(source, cloned, 'should clone sets');
    tt.false(cloned.has(obj), 'should clone values if objects');

    tt.end();
  });

  t.test('deep clone a date object', tt => {
    const source = new Date();
    const cloned = cloneDeep(source);

    tt.deepEqual(source, cloned, 'should clone date objects');
    tt.false(source === cloned, 'shouldn’t be the same object');

    tt.end();
  });

  t.end();
});
