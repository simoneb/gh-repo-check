import React from 'react'
import { Box } from '@material-ui/core'

export default function Gradient({ children }) {
  return (
    <Box
      display="flex"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      style={{
        backgroundImage: `url(background.png)`,
        backgroundSize: 'cover',
      }}
    >
      {children}
    </Box>
  )
}
