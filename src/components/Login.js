import React from 'react'
import { Box, Button } from '@material-ui/core'
import { clientId, redirectUri } from '../config'
import GitHub from '@material-ui/icons/GitHub'

import Gradient from './Gradient'

const loginUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}`

export default function Login() {
  return (
    <Gradient>
      <Button size="large" color="default" variant="contained" href={loginUrl}>
        <Box component={GitHub} mr={2} /> login
      </Button>
    </Gradient>
  )
}
