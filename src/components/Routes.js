import React, { lazy, Suspense, useContext } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Box, CircularProgress } from '@material-ui/core'

import { AuthContext } from './AuthProvider'
import Callback from './Callback'
import Dashboard from './Dashboard'
import Login from './Login'
import Navigation from './Navigation'

const AsyncGraphQLPlayground = lazy(() => import('./GraphQLPlayground'))
const AsyncHttpPlayground = lazy(() => import('./HttpPlayground'))

export default function Routes() {
  const { isAuthenticated } = useContext(AuthContext)

  return (
    <Switch>
      <Route path="/callback" component={Callback} />
      <Route path="/login" component={Login}></Route>
      {!isAuthenticated && <Redirect to="/login" />}
      <>
        <Navigation />
        <Suspense
          fallback={
            <Box m={2}>
              <CircularProgress />
            </Box>
          }
        >
          <Switch>
            <Route path="/graphql" component={AsyncGraphQLPlayground} />
            <Route path="/http" component={AsyncHttpPlayground} />
            <Route path="/:installationId?" component={Dashboard} />
          </Switch>
        </Suspense>
      </>
    </Switch>
  )
}
