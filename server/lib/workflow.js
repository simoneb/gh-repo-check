const Yaml = require('yaml')
const cartesian = require('./cartesian')

function expandWorkflow(yamlString) {
  const { jobs, ...rest } = Yaml.parse(yamlString)

  const newJobjs = expandJobs(jobs, yamlString)

  return {
    ...rest,
    jobs: newJobjs,
  }
}

function expandJobs(jobs, yamlContents) {
  return Object.entries(jobs).flatMap(([jobKey, job]) =>
    expandJob(jobKey, job, yamlContents)
  )
}

function expandJob(jobKey, job, yamlContents) {
  if (!job.strategy || !job.strategy.matrix) {
    return [{ [jobKey]: job }]
  }

  const combinations = cartesian(
    ...Object.entries(job.strategy.matrix).map(([k, vv]) =>
      (Array.isArray(vv) ? vv : [vv]).map(v => ({
        name: k,
        value: v,
      }))
    )
  )

  return combinations.map(c => {
    const newJobKey = `${jobKey} (${c.map(c => c.value).join(' - ')})`

    return { [newJobKey]: expandMatrix(jobKey, c, yamlContents) }
  })
}

function expandMatrix(jobKey, matrix, yamlContents) {
  const replaced = matrix.reduce((acc, { name, value }) => {
    const regexp = new RegExp(`\\$\\{\\{\\s*matrix.${name}\\s*}}`, 'g')

    return acc.replace(regexp, value)
  }, yamlContents)

  const { strategy, ...job } = Yaml.parse(replaced).jobs[jobKey]

  return job
}

module.exports = {
  expandWorkflow,
}
