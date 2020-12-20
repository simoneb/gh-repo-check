import React, { useCallback, useContext } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

import spec from '../api.github.com.json'
import { AuthContext } from './AuthProvider'

export default function HttpPlayground() {
  const { token } = useContext(AuthContext)

  const requestInterceptor = useCallback(
    req => {
      req.headers.authorization = `bearer ${token?.access_token}`
      return req
    },
    [token]
  )

  return (
    <SwaggerUI
      docExpansion="none"
      requestInterceptor={requestInterceptor}
      spec={spec}
    />
  )
}
