const cartesian = require('./cartesian')

const tap = require('tap')

tap.test('simple', async t => {
  t.deepEqual(cartesian([1, 2], ['a', 'b', 'c']), [
    [1, 'a'],
    [1, 'b'],
    [1, 'c'],
    [2, 'a'],
    [2, 'b'],
    [2, 'c'],
  ])
})
