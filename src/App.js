import React from 'react'
import { createMuiTheme, CssBaseline, ThemeProvider } from '@material-ui/core'
import { GraphQLClient, ClientContext } from 'graphql-hooks'
import { BrowserRouter } from 'react-router-dom'
import AuthProvider, { readTokenFromStorage } from './components/AuthProvider'
import Routes from './components/Routes'
import { githubGraphQLApi } from './config'

const theme = createMuiTheme({
  palette: {
    type: 'light',
  },
})

const client = new GraphQLClient({
  url: githubGraphQLApi,
})

const token = readTokenFromStorage()

if (token) {
  client.setHeader('authorization', `bearer ${token.access_token}`)
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ClientContext.Provider value={client}>
        <AuthProvider>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </AuthProvider>
      </ClientContext.Provider>
    </ThemeProvider>
  )
}
