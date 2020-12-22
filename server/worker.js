require('dotenv').config()

const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')
const Redis = require('ioredis')
const YAML = require('yaml')
const jsonata = require('jsonata')
const npm = require('npm')
const { promisify } = require('util')
const semver = require('semver')

const npmLoad = promisify(npm.load)
const npmDistTags = promisify(npm.distTags)

const actionName = /fastify\/github-action-merge-dependabot/

const usesDependabotMergeActionExpression = jsonata(
  `$exists(jobs.*.steps[uses ~> ${actionName}])`
)

const nodeVersionsExpression = jsonata(
  `$distinct(jobs.*.steps[uses ~> /actions\\/setup-node/].with.'node-version')`
)

const { privateKey, appId, logLevel, redisUrl } = require('./config')
const { expandWorkflow } = require('./lib/workflow')

const logger = require('pino')({
  level: logLevel,
})

const redis = new Redis(redisUrl)

async function run() {
  await npmLoad()
  const nodeDistTags = await npmDistTags('node')

  const appToken = getAppToken()

  const installationsRes = await fetch(
    'https://api.github.com/app/installations',
    {
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `bearer ${appToken}`,
      },
    }
  )

  const installations = await installationsRes.json()

  logger.info(`found ${installations.length} installations`)

  await Promise.all(
    installations.map(i => processInstallation(i, appToken, nodeDistTags))
  )
}

run().then(
  () => redis.quit(),
  () => redis.quit()
)

async function processInstallation(installation, appToken, nodeDistTags) {
  const accessToken = await getInstallationToken(installation, appToken)

  const installationReposRes = await fetch(installation.repositories_url, {
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `bearer ${accessToken.token}`,
    },
  })

  const { repositories } = await installationReposRes.json()

  logger.info(
    `found ${repositories.length} repositories for installation ${installation.id} on ${installation.account.login}`
  )

  return Promise.all(
    repositories.map(r =>
      processRepository(installation, r, accessToken, nodeDistTags)
    )
  )
}

async function getInstallationToken(installation, appToken) {
  const accessTokenRes = await fetch(installation.access_tokens_url, {
    method: 'POST',
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `bearer ${appToken}`,
    },
  })

  const accessToken = await accessTokenRes.json()

  logger.info(`authenticated to installation id ${installation.id}`)

  return accessToken
}

async function calculateStatus(repository, accessToken, nodeDistTags) {
  const { delete_branch_on_merge: deleteBranchOnMerge } = repository

  const status = {
    lastChecked: new Date(),
    checks: {
      deleteBranchOnMerge,
      hasDefaultBranch: null,
      defaultBranchProtected: null,
      protectionExcludesAdmins: null,
      usesDependabotMergeAction: null,
      usesNodeLts: null,
    },
  }

  await calculateBranch(repository, accessToken, status)
  await calculateWorkflows(repository, accessToken, status, nodeDistTags)

  return status
}

async function calculateWorkflows(
  repository,
  accessToken,
  status,
  nodeDistTags
) {
  const workflowsRes = await fetch(`${repository.url}/actions/workflows`, {
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `bearer ${accessToken.token}`,
    },
  })
  const workflows = await workflowsRes.json()

  await processWorkflows(
    status.checks,
    repository,
    workflows,
    accessToken,
    nodeDistTags
  )
}

async function loadAllWorkflowsFiles(repository, workflows, accessToken) {
  const { contents_url: contentsUrl } = repository

  const workflowsContents = await Promise.all(
    workflows.workflows.map(async workflow => {
      if (!workflow.path || workflow.state !== 'active') {
        return
      }

      const workflowFileUrl = contentsUrl.replace(
        '{+path}',
        encodeURIComponent(workflow.path)
      )

      const workflowFileRes = await fetch(workflowFileUrl, {
        headers: {
          accept: 'application/vnd.github.v3+json',
          authorization: `bearer ${accessToken.token}`,
        },
      })

      const workflowFile = await workflowFileRes.json()

      let workflowContents

      try {
        workflowContents = Buffer.from(
          workflowFile.content,
          workflowFile.encoding
        ).toString('utf-8')
      } catch (err) {
        // ignore workflows which, when
        console.error(
          `ERROR: cannot read workflow ${workflowFileUrl} with path ${workflow.path} for ${repository.full_name}`
        )
        return
      }

      return workflowContents
    })
  )

  return workflowsContents.filter(Boolean)
}

async function processWorkflows(
  checks,
  repository,
  workflows,
  accessToken,
  nodeDistTags
) {
  const workflowsYamlStrings = await loadAllWorkflowsFiles(
    repository,
    workflows,
    accessToken
  )

  const workflowsObjects = workflowsYamlStrings.map(w => YAML.parse(w))

  const usesDependabotMergeAction = workflowsObjects.some(w =>
    usesDependabotMergeActionExpression.evaluate(w)
  )

  const allNodeVersions = [
    ...new Set(
      workflowsYamlStrings
        .flatMap(w => nodeVersionsExpression.evaluate(expandWorkflow(w)))
        .filter(Boolean)
        .map(v => v.toString())
    ),
  ]

  if (allNodeVersions.length) {
    checks.usesNodeLts = allNodeVersions.some(v =>
      semver.satisfies(nodeDistTags.lts, v)
    )
  }

  checks.usesDependabotMergeAction = usesDependabotMergeAction
}

async function calculateBranch(repository, accessToken, status) {
  const {
    branches_url: branchesUrl,
    default_branch: defaultBranch,
  } = repository

  status.checks.hasDefaultBranch = !!defaultBranch

  if (!defaultBranch) {
    return
  }

  const branchRes = await fetch(
    branchesUrl.replace('{/branch}', `/${defaultBranch}`),
    {
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `bearer ${accessToken.token}`,
      },
    }
  )

  const branch = await branchRes.json()

  const { protected: isProtected, protection } = branch

  status.checks.defaultBranchProtected = isProtected

  if (!isProtected) {
    return
  }

  status.checks.protectionExcludesAdmins =
    protection &&
    protection.required_status_checks.enforcement_level === 'non_admins'
}

async function processRepository(
  installation,
  repository,
  accessToken,
  nodeDistTags
) {
  const { id: installationId } = installation
  const { full_name: fullName } = repository

  logger.info(`processing repository ${fullName}`)

  return redis.hset(
    installationId,
    fullName,
    JSON.stringify(await calculateStatus(repository, accessToken, nodeDistTags))
  )
}

function getAppToken() {
  const now = Math.floor(Date.now() / 1000)

  const appToken = jwt.sign(
    {
      iat: now,
      // 10 minutes
      exp: now + 10 * 60,
      iss: appId,
    },
    privateKey,
    { algorithm: 'RS256' }
  )

  logger.info('generated app token')

  return appToken
}
