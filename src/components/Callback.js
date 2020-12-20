import React, { useContext, useEffect, useState } from 'react'
import { Box, CircularProgress, Link, Typography } from '@material-ui/core'
import { Redirect, Link as RouterLink } from 'react-router-dom'
import { AuthContext } from './AuthProvider'
import Gradient from './Gradient'

export default function Callback() {
  const { isAuthenticated, login } = useContext(AuthContext)
  const [error, setError] = useState()

  useEffect(() => {
    const search = new URLSearchParams(window.location.search)

    const { code, ...error } = Array.from(search.entries()).reduce(
      (acc, [k, v]) => ({ ...acc, [k]: v }),
      {}
    )

    if (code) {
      login(code)
    } else {
      setError(error)
    }
  }, [login])

  if (isAuthenticated) return <Redirect to="/" />

  if (error) {
    return (
      <Box>
        <Typography>Error: {error.error}</Typography>
        <Typography>{error.error_description}</Typography>
        <Link href={error.error_uri} target="_blank">
          <Typography>More details</Typography>
        </Link>
        <Link component={RouterLink} to="/">
          <Typography>Home</Typography>
        </Link>
      </Box>
    )
  }

  return (
    <Gradient>
      <CircularProgress />
    </Gradient>
  )
}
