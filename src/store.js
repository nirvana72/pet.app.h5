import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    config: {
      api_host: '',
      oss_host: '',
      oss_endpoint: '',
      oss_accessKeyId: '',
      oss_accessKeySecret: '',
      oss_bucket: '',
      oss_region: '',
    },
    session: {
      uid: -1,
      token: '',
      time: '',
    },
    device: {
      width: 0,
      height: 0,
      env: 'app',
      version: '',
    },
  },
  getters: {
    config: state => state.config,
    session: state => state.session,
    device: state => state.device,
  },
  mutations: {
    setConfig(state, _config) {
      Object.keys(state.config).forEach(key => {
        if (_config[key]) state.config[key] = _config[key]
      })
    },
    setSession(state, _session) {
      Object.keys(state.session).forEach(key => {
        if (_session[key]) state.session[key] = _session[key]
      })
      state.session.time = new Date().getTime()
    },
    setDevice(state, _device) {
      Object.keys(state.device).forEach(key => {
        if (_device[key]) state.device[key] = _device[key]
      })
    },
  },
  actions: {},
})
