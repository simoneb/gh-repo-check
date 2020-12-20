const { CLIENT_SECRET, PRIVATE_KEY, APP_ID, LOG_LEVEL } = process.env

module.exports = {
  clientSecret: CLIENT_SECRET,
  appId: APP_ID,
  privateKey: PRIVATE_KEY,
  logLevel: LOG_LEVEL || 'info',
}
