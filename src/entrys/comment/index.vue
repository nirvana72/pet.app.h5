<template>
  <div>
    <nj-comments v-if="articleId > 0"  
      style="margin:20px;"
      ref="comments"
      :targetId="articleId"
      :authorId="authorId"
      @onLoaded="commentLoaded"
      @onReply="commentReply"
      @onPosted="commentPosted"
      @onAlert="commentAlert"
      @onError="commentError"/>
      <div v-show="showOverlay" @click="showOverlay = false" class="main-overlayer"></div>
  </div>
  
</template>

<script>
import comments from '@/components/nj-comments.vue'

export default {
  components: { 'nj-comments': comments, },
  data() {
    return {
      initOnce: false,
      articleId: -1,
      authorId: -1,
      showOverlay: false
    }
  },
  created() {
    // 暴露一个方法到windows，供swift调用
    window.nativeCallJs = this.nativeCallJs
  },
  methods: {
    jsCallNative(jsonString) {
      if(this.$store.getters.device.env == 'ios') {
        window.webkit.messageHandlers.jsCallNative.postMessage(jsonString)
      }
      if(this.$store.getters.device.env == 'android') {
        window.android.jsCallAndroid(jsonString)
      }
    },
    nativeCallJs(json) {      
      switch(json.cmd) {
        case 'init': {
          if (!this.initOnce) {
            this.initOnce = true
            this.$store.commit("setSession", json.session)
            this.$store.commit("setConfig", json.config)
            this.$store.commit("setDevice", json.device)
            this.articleId = json.params.articleId
            this.authorId = json.params.authorId
          }          
          break;
        }
        case 'refreshToken': {
          this.$store.commit("setSession", {token: json.token})
          break;
        }
        case 'postComment': {
          this.$refs.comments.postComment(json.content, json.isReplySubject)
          break;
        }
        case 'setOverlay': {
          // ios 打开软键盘时，点击其它区域遮挡事件
          this.showOverlay = json.display
          break;
        }
      }
    },    
    commentLoaded() {
      this.jsCallNative('{"cmd":"didLoad"}')
    },
    commentReply(replyTo) {
      this.jsCallNative(`{"cmd":"reply","replyTo":"${replyTo}"}`)
    },
    commentPosted() {
      this.showOverlay = false
      this.jsCallNative(`{"cmd":"posted"}`)
    },
    commentAlert(msg) {
      this.jsCallNative(`{"cmd":"alert","msg":"${msg}"}`)
    },
    commentError(msg) {
      if(msg === 'token-expired') {
        this.jsCallNative(`{"cmd":"token-expired"}`)
      }else {
        this.jsCallNative(`{"cmd":"error","msg":"${msg}"}`)
      }
    }
  }
}
</script>