import React, { useCallback } from 'react'
import { Box } from '@material-ui/core'
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
    <Box mt={2}>
      <Box ml={1} mb={1}>
        <InstallationSelector
          installationId={installationId}
          onChange={handleInstallationChange}
        />
      </Box>
      {installationId && <Repositories installationId={installationId} />}
    </Box>
  )
}
