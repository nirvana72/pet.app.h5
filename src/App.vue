<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  data() {
    return {}
  },
  created() {
    const device = {}
    device.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    device.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    device.env = 'app'
    this.$store.commit('setDevice', device)
  }
}
</script>

