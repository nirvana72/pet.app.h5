import axios from 'axios'
import store from '@/store'

// create an axios instance
const service = axios.create({
  // baseURL: // api 的 base_url
  timeout: 5000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // Do something before request is sent
    config.baseURL = store.getters.config.api_host // "https://api.mu78.com/app"
    config.headers['ClientDevice'] = store.getters.device.version
    if (store.getters.session.token !== '') {
      config.headers['Authorization'] = 'Bearer ' + store.getters.session.token
      config.headers['ClientUid'] = store.getters.session.uid
    }
    return config
  },
  error => {
    // Do something with request error
    // console.log(error) // for debug
    Promise.reject(error)
  },
)

// response interceptor
service.interceptors.response.use(
  response => response,
  error => {
    // if (error.response && error.response.data) {
    //   if (error.response.data.error === 'Invalid token') {
    //     alert('登录信息过期,需要重新登录')
    //   }
    // }
    // console.log(error.response.data) // for debug
    return Promise.reject(error)
  },
)

export default service
