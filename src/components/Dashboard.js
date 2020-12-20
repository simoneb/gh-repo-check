import React, { useCallback } from 'react'
import { Box, Paper } from '@material-ui/core'
import { useHistory, useParams } from 'react-router-dom'

import InstallationSelector from './InstallationSelector'
import Repositories from './Repositories'

export default function Dashboard() {
  const { installationId } = useParams()
  const history = useHistory()

  const handleInstallationChange = useCallback(
    installationId => {
      history.push(`/${installationId}`)
    },
    [history]
  )
  return (
    <Box m={2} mt={2}>
      <InstallationSelector
        installationId={installationId}
        onChange={handleInstallationChange}
      />
      {installationId && (
        <Paper variant="outlined">
          <Repositories installationId={installationId} />
        </Paper>
      )}
    </Box>
  )
}
