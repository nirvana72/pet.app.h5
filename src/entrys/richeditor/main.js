import Vue from 'vue'
import App from '@/App.vue'
import Router from 'vue-router'
import store from '@/store.js'
import Request from '@/utils/request.js'
import Vuetify, { VApp } from 'vuetify/lib'
import 'normalize.css/normalize.css'
import 'material-design-icons-iconfont/dist/material-design-icons.css'
import '@/style/main.scss'
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify, {
  components: {
    VApp,
  },
})

Vue.prototype.$Ajax = Request

Vue.config.productionTip = false

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      component: () => import('@/entrys/richeditor/index.vue'),
    },
  ],
})

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
