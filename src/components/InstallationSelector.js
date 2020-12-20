import React, { useMemo } from 'react'
import {
  Avatar,
  Box,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core'
import Settings from '@material-ui/icons/Settings'
import AddCircle from '@material-ui/icons/AddCircle'

import useGithub from '../hooks/useGithub'
import { appPublicLink } from '../config'

export default function InstallationSelector({ installationId, onChange }) {
  const [{ data, loading }] = useGithub({
    url: 'user/installations',
    params: {
      per_page: 100,
      page: 1,
    },
  })

  const installation = useMemo(() => {
    if (!installationId || !data) {
      return
    }

    return data.installations.find(i => i.id === +installationId)
  }, [installationId, data])

  if (loading) {
    return <CircularProgress />
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Select
          displayEmpty
          variant="outlined"
          onChange={e => onChange(e.target.value)}
          value={installationId || ''}
          style={{ minWidth: 250 }}
        >
          <MenuItem disabled value="">
            Select an installation
          </MenuItem>
          {data.installations.map(inst => (
            <MenuItem key={inst.id} value={inst.id}>
              <Box display="flex" flexWrap="nowrap" alignItems="center">
                <Box
                  component={Avatar}
                  mr={1}
                  size="small"
                  src={inst.account.avatar_url}
                />
                <Typography>{inst.account.login}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
        {installation && (
          <Box ml={2}>
            <Tooltip title="Configure installation">
              <IconButton target="_blank" href={installation.html_url}>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <Box ml={2}>
          <Tooltip title="New installation">
            <IconButton
              target="_blank"
              href={`${appPublicLink}/installations/new`}
            >
              <AddCircle color="primary" fontSize="large" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {!data.installations.length && (
        <Typography color="error">
          You haven't installed the application in any of your accounts
        </Typography>
      )}
    </Box>
  )
}
