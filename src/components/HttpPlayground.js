import React, { useCallback } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

import spec from '../api.github.com.json'

export default function HttpPlayground({ accessToken }) {
  const requestInterceptor = useCallback(
    req => {
      req.headers.authorization = `bearer ${accessToken}`
      return req
    },
    [accessToken]
  )

  return (
    <SwaggerUI
      docExpansion="none"
      requestInterceptor={requestInterceptor}
      spec={spec}
    />
  )
}
