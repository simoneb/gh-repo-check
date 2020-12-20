import { githubApi } from '../config'
import makeUseAuthenticatedApi from './makeUseAuthenticatedApi'

const useGithub = makeUseAuthenticatedApi(githubApi)

export default useGithub
