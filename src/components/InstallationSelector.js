import React, { useMemo } from 'react'
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from '@material-ui/core'
import Settings from '@material-ui/icons/Settings'
import AddCircle from '@material-ui/icons/AddCircle'
import Person from '@material-ui/icons/Person'
import Business from '@material-ui/icons/Business'

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
          style={{ minWidth: 280 }}
        >
          <MenuItem disabled value="">
            Select an account
          </MenuItem>
          {data.installations.map(inst => (
            <MenuItem key={inst.id} value={inst.id}>
              <Box
                width="100%"
                display="flex"
                flexWrap="nowrap"
                alignItems="center"
              >
                <Box
                  component={Avatar}
                  mr={1}
                  size="small"
                  src={inst.account.avatar_url}
                />
                <Typography>{inst.account.login}</Typography>
                <Box ml="auto" mr={1}>
                  <Tooltip title={inst.target_type}>
                    {inst.target_type === 'User' ? (
                      <Person color="disabled" fontSize="small" />
                    ) : (
                      <Business color="disabled" fontSize="small" />
                    )}
                  </Tooltip>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
        <Box
          component={ButtonGroup}
          variant="outlined"
          color="secondary"
          size="large"
          ml="auto"
        >
          {installation && (
            <Button
              color="secondary"
              startIcon={<Settings />}
              target="_blank"
              href={installation.html_url}
            >
              Configure
            </Button>
          )}
          <Button
            color="secondary"
            startIcon={<AddCircle />}
            target="_blank"
            href={`${appPublicLink}/installations/new`}
          >
            New installation
          </Button>
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
