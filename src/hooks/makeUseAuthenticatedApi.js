import Axios from 'axios'
import { makeUseAxios } from 'axios-hooks'

import { readTokenFromStorage } from '../components/AuthProvider'

export default function makeUseAuthenticatedApi(apiUrl) {
  const axios = Axios.create({
    baseURL: apiUrl,
  })

  axios.interceptors.request.use(config => {
    const token = readTokenFromStorage()

    if (token) {
      config.headers = {
        ...config.headers,
        authorization: `bearer ${token.access_token}`,
      }
    }

    return config
  })

  return makeUseAxios({
    axios,
  })
}
