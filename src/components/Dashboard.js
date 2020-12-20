import { Box } from '@material-ui/core'
import React from 'react'
import { useParams } from 'react-router-dom'
import InstallationSelector from './InstallationSelector'
import Repositories from './Repositories'

export default function Dashboard() {
  const { installationId } = useParams()

  return (
    <Box mt={2}>
      <Box ml={1} mb={1}>
        <InstallationSelector installationId={installationId} />
      </Box>
      {installationId && <Repositories installationId={installationId} />}
    </Box>
  )
}
