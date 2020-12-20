import React, { useContext, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Link,
  makeStyles,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@material-ui/core'
import { Link as RouterLink } from 'react-router-dom'
import ExitToApp from '@material-ui/icons/ExitToApp'
import MoreVert from '@material-ui/icons/MoreVert'
import OpenInNew from '@material-ui/icons/OpenInNew'

import { AuthContext } from './AuthProvider'
import { clientId } from '../config'

const useStyles = makeStyles(theme => ({
  actions: {
    display: 'flex',
    marginLefgt: 'auto',
    '& > * + *': {
      marginLeft: theme.spacing(2),
    },
  },
}))

export default function Navigation() {
  const { logout } = useContext(AuthContext)
  const classes = useStyles()
  const [anchorEl, setAnchorEl] = useState()

  const handleClick = event => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Link component={RouterLink} to="/">
            <Box color="white" display="flex" alignItems="center">
              <Box mr={2} component={Avatar} src="favicon.png" />
              <Typography variant="h6">GitHub Repo Check</Typography>
            </Box>
          </Link>
          <Box ml="auto" className={classes.actions}>
            <IconButton color="inherit" onClick={handleClick}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              keepMounted
              open={!!anchorEl}
              onClose={handleClose}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <MenuItem
                onClick={handleClose}
                component={Link}
                href={`https://github.com/settings/connections/applications/${clientId}`}
                target="_blank"
              >
                Review Permissions
                <Box component={OpenInNew} ml={1} fontSize="medium" />
              </MenuItem>
              <MenuItem
                component={RouterLink}
                to="/playground"
                onClick={handleClose}
              >
                GraphQL Playground
              </MenuItem>
              <MenuItem component={RouterLink} to="/http" onClick={handleClose}>
                HTTP Playground
              </MenuItem>
            </Menu>
            <IconButton color="inherit" onClick={logout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </Box>
  )
}
