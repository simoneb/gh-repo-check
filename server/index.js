const path = require('path')
const fetch = require('node-fetch')

const { clientSecret } = require('./config')

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

  fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '../build'),
  })

  fastify.setNotFoundHandler((_, reply) => reply.sendFile('index.html'))
}
