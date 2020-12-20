require('dotenv').config()

const jwt = require('jsonwebtoken')
const fetch = require('node-fetch')

const { privateKey, appId, logLevel } = require('./config')

const logger = require('pino')({
  level: logLevel,
})

async function run() {
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

  await Promise.all(installations.map(i => processInstallation(i, appToken)))
}

run()

async function processInstallation(installation, appToken) {
  const accessToken = await getInstallationToken(installation, appToken)

  const installationReposRes = await fetch(installation.repositories_url, {
    headers: {
      accept: 'application/vnd.github.v3+json',
      authorization: `bearer ${accessToken.token}`,
    },
  })

  const { repositories } = await installationReposRes.json()

  logger.info(
    `found ${repositories.length} repository for installation ${installation.id}`
  )

  return Promise.all(repositories.map(r => processRepository(r, accessToken)))
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

async function processRepository(repository, accessToken) {
  const {
    full_name: fullName,
    branches_url: branchesUrl,
    default_branch: defaultBranch,
  } = repository

  logger.info(`processing repository ${fullName}`)

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

  logger.info(
    { fullName, defaultBranch, protected: isProtected, protection },
    `processed repository ${fullName}`
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
