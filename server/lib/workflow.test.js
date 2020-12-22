const fs = require('fs')
const path = require('path')
const tap = require('tap')

const { expandWorkflow } = require('./workflow')

const readFile = f => fs.readFileSync(path.join(__dirname, f), 'utf8')

tap.test('workflow1', async t => {
  const workflow1 = readFile('./fixtures/workflow1.yml')

  console.log(JSON.stringify(expandWorkflow(workflow1), null, 2))
})

tap.test('workflow2', async t => {
  const workflow2 = readFile('./fixtures/workflow2.yml')

  console.log(JSON.stringify(expandWorkflow(workflow2), null, 2))
})

tap.test('workflow3', async t => {
  const workflow3 = readFile('./fixtures/workflow3.yml')

  console.log(JSON.stringify(expandWorkflow(workflow3), null, 2))
})
