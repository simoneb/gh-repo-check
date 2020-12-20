import { ClientContext } from 'graphql-hooks'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { clientId, redirectUri } from '../config'

export const AuthContext = React.createContext()

export default function AuthProvider({ children }) {
  const client = useContext(ClientContext)
  const [token, setToken] = useState(() => readTokenFromStorage())

  useEffect(() => {
    if (token) {
      client.setHeader('authorization', `bearer ${token.access_token}`)
    } else {
      client.removeHeader('authorization')
    }
  }, [client, token])

  const login = useCallback(async code => {
    const response = await fetch(`/login/oauth/access_token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        redirect_uri: redirectUri,
      }),
    })

    const token = await response.json()

    setToken(token)
    sessionStorage.setItem('token', JSON.stringify(token))
  }, [])

  const logout = useCallback(() => {
    setToken()
    sessionStorage.removeItem('token')
  }, [])

  const value = useMemo(
    () => ({
      login,
      logout,
      isAuthenticated: !!token,
      token,
    }),
    [login, logout, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function readTokenFromStorage() {
  return JSON.parse(sessionStorage.getItem('token') || 'null')
}
