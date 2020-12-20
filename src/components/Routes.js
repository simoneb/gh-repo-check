import React, { useContext } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import {
  Playground as GraphQLPlayground,
  store,
} from 'graphql-playground-react'
import { Provider } from 'react-redux'

import { githubGraphQLApi } from '../config'
import { AuthContext } from './AuthProvider'
import HttpPlayground from './HttpPlayground'
import Callback from './Callback'
import Dashboard from './Dashboard'
import Login from './Login'
import Navigation from './Navigation'

export default function Routes() {
  const { isAuthenticated, token } = useContext(AuthContext)

  return (
    <Switch>
      <Route path="/callback" component={Callback} />
      <Route path="/login" component={Login}></Route>
      {!isAuthenticated && <Redirect to="/login" />}
      <>
        <Navigation />
        <Switch>
          <Route path="/playground">
            <Provider store={store}>
              <GraphQLPlayground
                endpoint={githubGraphQLApi}
                headers={{ authorization: `bearer ${token?.access_token}` }}
              />
            </Provider>
          </Route>
          <Route path="/http">
            <HttpPlayground accessToken={token?.access_token} />
          </Route>
          <Route path="/:installationId?" component={Dashboard} />
        </Switch>
      </>
    </Switch>
  )
}
