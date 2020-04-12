<template>
  <div v-if="didLoad" class="nj-article-show">
    <div class="nj-avatar" @click="authorClick(Article.authorId)">
      <img :src="converter.avatarPath(Article.avatar)" />
    </div>
    <h1 class="nj-tit" v-html="converter.rn2htmlbr(Article.title)"></h1>
    <h2 class="nj-author">
      {{ Article.writetime }} | {{ Article.authorname }}
    </h2>

    <div v-if="Article.type === 'image'" class="nj-images">
      <img v-for="(fname, j) in Article.images" :key="j"          
          :src="converter.ossPath(Article.writetime, Article.Id, fname) + converter.AliOssThumb['img' + Math.min(3, Article.images.length)]"
          :style="converter.imageStyle(Article.images.length)"
          @click="imgClick(j)"/>
    </div>

    <div v-if="Article.type === 'video'" class="nj-video">
      <img :style="{ height: videoHeight + 'px'}"
        :src="converter.ossPath(Article.writetime, Article.Id, Article.videos[0].fname) + converter.AliOssThumb['video']"/>
      <v-icon color="#ffffff" size="50" @click="videoClick()">play_circle_filled</v-icon>
      <span class="duration">{{ converter.durationString(Article.videos[0].duration) }}</span>
    </div>

    <div v-if="Article.type === 'rich'" class="nj-content" v-html="Article.content"></div>

    <div v-if="Article.postAddr !== ''" class="nj-postAddr">
      <v-icon class="nj-place">place</v-icon>
      {{ Article.postAddr }}
    </div>

    <div style="margin:50px 0 150px 0;">
      <nj-comments ref="comments"
                :targetId="Article.Id"
                :authorId="Article.authorId"
                @onReply="commentReply"
                @onPosted="commentPosted"
                @onAlert="commentAlert"
                @onError="commentError"/>
    </div>

    <div v-show="showOverlay" @click="showOverlay = false" class="main-overlayer"></div>
  </div>
</template>

<script>
import { VIcon } from 'vuetify/lib'
import { articleConvert } from '@/utils/tools'
import comments from '@/components/nj-comments.vue'

export default {
  components: { VIcon, 'nj-comments': comments, },
  data() {
    return {
      initOnce: false,
      didLoad: false,
      converter: articleConvert,
      showOverlay: false,
      Article: {
        Id: -1,
        title: '',
        type: 'rich',
        authorId: '',
        authorname: '',
        avatar: 1,
        status: 0,
        writetime: '',
        postAddr: '',
        content: '',
        images: [],
        videos: [],
        liked: false
      },
      videoHeight: 250
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
            this.getArticle(json.params.articleId)

            this.videoHeight = (this.$store.getters.device.width - 40) * 9 / 16
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
    getArticle(aId) {
      this.$Ajax({
        method: 'get', url: `/articles/${aId}`
      }).then((response) => {
        if(response.data.ret < 0) {
          this.jsCallNative(`{"cmd":"error","msg":"${response.data.msg}"}`)
        } else {
          Object.keys(this.Article).forEach(key => {
            if (response.data.article[key]) this.Article[key] = response.data.article[key]
          })
          this.didLoad = true
          this.jsCallNative('{"cmd":"didLoad"}')
          if (this.$store.getters.session.uid > 0) {
            this.jsCallNative(`{"cmd":"setLike","msg": "${this.Article.liked}"}`) // 返回收藏状态，由原生处理收藏逻辑
          }          
          // 富文本内容图片点击查看图集
          if (this.Article.type === "rich") {
            this.makeRichTextImgClick()
          }
        }
      }).catch((err) => {        
        this.jsCallNative('{"cmd":"error","msg":"网络好像有点问题"}')
      })
    },
    authorClick() {
      this.jsCallNative('{"cmd":"authorClick","authorId":' + this.Article.authorId + '}')
    },
    imgClick(startIndex) {
      let list = JSON.stringify(this.Article.images)
      this.jsCallNative(`{"cmd":"imgClick","startIndex":${startIndex},"writetime":"${this.Article.writetime}","list":${list}}`)
    },
    videoClick() {
      let url = this.converter.ossPath(this.Article.writetime, this.Article.Id, this.Article.videos[0].fname)
      this.jsCallNative(`{"cmd":"videoClick","videoUrl":"${url}"}`)
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
    },
    makeRichTextImgClick() {
      let _this = this
      setTimeout(() => { // 需要等内容绑定完成之后处理
        let imgs = document.querySelectorAll('div.nj-content img.oss-image')
        let srcs = []
        for (let i = 0; i < imgs.length; i++) {
          srcs.push(imgs[i].src)
        }
        srcs = JSON.stringify(srcs)
        for (let i = 0; i < imgs.length; i++) {
          imgs[i].addEventListener('click', () => {
            _this.jsCallNative(`{"cmd":"richImageClick","startIndex":${i},"list":${srcs}}`)
          }, false);
        }

        let videos = document.querySelectorAll('div.nj-content video.oss-video')
        videos.forEach(vid => {
          vid.poster = vid.src + _this.converter.AliOssThumb['video']
        });
      }, 1000);
    }
  }
}
</script>