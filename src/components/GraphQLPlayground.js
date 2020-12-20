import React, { useContext } from 'react'
import { Playground, store } from 'graphql-playground-react'
import { Provider } from 'react-redux'

import { githubGraphQLApi } from '../config'
import { AuthContext } from './AuthProvider'

export default function GraphQLPlayground() {
  const { token } = useContext(AuthContext)

  return (
    <Provider store={store}>
      <Playground
        endpoint={githubGraphQLApi}
        headers={{ authorization: `bearer ${token?.access_token}` }}
      />
    </Provider>
  )
}
