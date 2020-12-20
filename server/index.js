const path = require('path')
const fetch = require('node-fetch')
const { Unauthorized } = require('http-errors')

const { clientSecret, redisUrl } = require('./config')

async function getAccessibleRepositories(req) {
  const { installationId } = req.params
  const match = /bearer (.+)$/.exec(req.headers.authorization)

  if (!match || !match[1]) {
    throw new Unauthorized()
  }

  const [, token] = match

  const reposResponse = await fetch(
    `https://api.github.com/user/installations/${installationId}/repositories?${new URLSearchParams(
      req.query
    )}`,
    {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        authorization: `bearer ${token}`,
      },
    }
  )

  req.repositories = await reposResponse.json()
}

module.exports = async function (fastify, options) {
  fastify.post('/login/oauth/access_token', async req => {
    const response = await fetch(
      `https://github.com/login/oauth/access_token`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...req.body,
          client_secret: clientSecret,
        }),
      }
    )

    return response.json()
  })

  fastify.get('/repositories/:installationId', {
    onRequest: [getAccessibleRepositories],
    async handler(req) {
      const {
        repositories: { repositories, total_count },
      } = req
      const { installationId } = req.params

      return {
        repositories: await Promise.all(
          repositories.map(async r => ({
            ...r,
            status: JSON.parse(
              await fastify.redis.hget(installationId, r.full_name)
            ),
          }))
        ),
        total_count,
      }
    },
  })

  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '../build'),
  })

  fastify.setNotFoundHandler((_, reply) => reply.sendFile('index.html'))

  fastify.register(require('fastify-redis'), {
    url: redisUrl,
  })
}
