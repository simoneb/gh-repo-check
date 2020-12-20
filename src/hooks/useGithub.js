import Axios from 'axios'
import { makeUseAxios } from 'axios-hooks'

import { readTokenFromStorage } from '../components/AuthProvider'
import { githubApi } from '../config'

export const github = Axios.create({
  baseURL: githubApi,
})

github.interceptors.request.use(config => {
  const token = readTokenFromStorage()

  if (token) {
    config.headers = {
      ...config.headers,
      authorization: `bearer ${token.access_token}`,
    }
  }

  return config
})

const useGithub = makeUseAxios({
  axios: github,
})

export default useGithub
