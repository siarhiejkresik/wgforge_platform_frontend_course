/* eslint-disable filenames/match-regex */
import test from 'tape-catch';
import _merge from 'lodash.merge';
import deepMerge from '../exercises/deepMerge';

const destinationObject = {
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

const sourceObject = {
  forgeFrontend: {
    coaches: [{ surname: 'billibob' }, { surname: 'ivanov' }]
  },
  forgeBackend: {
    students: ['Student 3', 'Student 4']
  },
  forgeMaintaince: [
    {
      part1: {
        students: ['Student 9', 'Student 10']
      }
    },
    {
      part2: {
        coaches: ['Coache 7', 'Coache 8']
      }
    }
  ]
};

test('deepMerge', t => {
  t.equal(typeof deepMerge, 'function');

  const dstClone = () => JSON.parse(JSON.stringify(destinationObject));

  const deepMergeResult = deepMerge(dstClone(), sourceObject);
  const expectedMergeResult = _merge(dstClone(), sourceObject);

  t.test('deep merge two objects', tt => {
    tt.deepEqual(deepMergeResult, expectedMergeResult);
    tt.end();
  });

  t.end();
});

test('shouldn’t rewrite value with undefined', t => {
  const key = 'k';
  const value = 'val';
  const sObj = { [key]: undefined };
  const dObj = { [key]: value };

  const mergedObj = deepMerge(dObj, sObj);

  t.ok(mergedObj[key] === value);
  t.end();
});

test('should deep merge an example from task description', t => {
  const dst = {
    students: [{ name: 'Unit 1' }, { name: 'Unit 2' }],
    label: 'backend',
    count: 1
  };

  const src = {
    students: [{ surname: 'Forge 1' }, { surname: 'Forge 2' }],
    label: 'frontend'
  };

  const expected = {
    students: [{ name: 'Unit 1', surname: 'Forge 1' }, { name: 'Unit 2', surname: 'Forge 2' }],
    label: 'frontend',
    count: 1
  };

  deepMerge(dst, src);

  t.deepEqual(dst, expected);
  t.end();
});
