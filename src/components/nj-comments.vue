<template>
  <div class="nj-comments">
    <div class="comments-list">
      <div v-if="comments.length <= 0" class="comments-empty">还没有人评论过。。。</div>
      <div v-for="(comment) in comments" :key="comment.Id" class="comment">
        <img :src="converter.avatarPath(comment.avatar)" class="comments-avatar" alt="">
        <div v-once class="comment-user">
          <span v-if="comment.uid == authorId" class="comment-author">作者</span>
          <span v-else>{{ comment.uname }}</span>
           ● {{ converter.passTimeFormat(comment.writetime) }}
        </div>
        <div class="comment-content" @click="func_reply({parentId:comment.Id,replyId:comment.Id, replyTo: comment.uname})">
          <span v-if="comment.status === '1'" v-html="converter.rn2htmlbr(comment.content)"></span>
          <span v-else>评论内容已被系统屏蔽！</span>
        </div>
        <div class="comment-vote">          
          <v-btn flat icon :ripple="false" @click="func_vote(comment, 'voteup')">
            <v-icon :color="comment.voted === 'voteup'?'red':'#a2a2a2'">thumb_up_alt</v-icon>
            {{ comment.voteup }}
          </v-btn>
        </div>      
        <div v-for="(subcomment) in comment.comments" :key="subcomment.Id" class="subcomment">
          <img :src="converter.avatarPath(subcomment.avatar)" class="subcomment-avatar" alt="">
          <div v-once class="comment-user">
            <span v-if="subcomment.uid == authorId" class="comment-author">作者</span>
            <span v-else>{{ subcomment.uname }}</span>
            <span v-if="subcomment.reply_id !== '0'" class="comment-reply">@
              <span v-if="subcomment.reply_uid == authorId" class="comment-author">作者</span>
              <span v-else>{{ subcomment.reply_name }}</span>
            </span>
            ● {{ converter.passTimeFormat(subcomment.writetime) }}
          </div>
          <div class="comment-content" @click="func_reply({parentId:subcomment.parent_id,replyId:subcomment.Id, replyTo: subcomment.uname})">
            <span v-if="subcomment.status === '1'" v-html="converter.rn2htmlbr(subcomment.content)"></span>
            <span v-else>评论内容已被系统屏蔽！</span>
          </div>
          <div class="comment-vote">
            <v-btn flat icon :ripple="false" @click="func_vote(subcomment, 'voteup')">
              <v-icon :color="subcomment.voted === 'voteup'?'red':'#a2a2a2'">thumb_up_alt</v-icon>
              {{ subcomment.voteup }}
            </v-btn>
          </div>
        </div>
        <div v-if="comment.hasmore != false && comment.comments && comment.comments.length >= 10" @click="loadSubComments(comment)" class="comment-loadmore">
          <span>展开更多</span>
        </div>
      </div>
      <div v-if="loadmore" @click="loadComments()" class="comment-loadmore" style="margin: 20px 0;">
        <span>更多评论</span>
      </div>
    </div>    
  </div>
</template>
<script>
import { VBtn, VIcon } from 'vuetify/lib'
import { articleConvert, passTimeFormat } from "@/utils/tools.js"
import "@/style/comment.scss"

export default {
  components: { VBtn, VIcon },
  props: {
    targetId: {
      type: [Number, String],
      default: 0
    },
    authorId: {
      type: [Number, String],
      default: 0
    }
  },
  data: function () {
    return {
      comments: [],
      loadmore: false,
      islogin: false,
      converter: articleConvert,
      query: { page: 1 },
      reply: {
        parentId: 0,
        replyId: 0,
        content: ''
      }
    }
  },
  created() {
    this.converter.passTimeFormat = passTimeFormat

    this.islogin = this.$store.getters.session.uid > 0
    this.loadComments()
  },
  methods: {
    loadComments(p){
      if (p) { this.query.page = p }
      if (this.query.page == 1) {
        this.comments = []
      }
      this.$Ajax({
        method: 'get', url: '/comments/',        
        params: {target_id: this.targetId , page: this.query.page}
      }).then((response) => { 
        if(response.data.ret == 1) {
          this.comments = this.comments.concat(response.data.comments)
          this.query.page++
          this.loadmore = response.data.comments.length >= 10
        }         
        this.$emit('onLoaded')
      }).catch((http) => {
        this.$emit('onError', http)
      })
    },
    loadSubComments(comment) {
      let last_id = comment.comments[comment.comments.length - 1].Id
      this.$Ajax({
        method: 'get', url: '/comments/sub',        
        params: {target_id: this.targetId , parent_id: comment.Id, last_id: last_id}
      }).then((response) => {
        if(response.data.ret == 1) {
          comment.comments = comment.comments.concat(response.data.comments)
          if(response.data.comments.length < 10){
            comment.hasmore = false
          }
        }
      }).catch((http) => {
        this.$emit('onError', http)
      })
    },   
    func_reply({parentId, replyId, replyTo}){
      if (!this.islogin) {
        this.$emit('onError', '登录后回复')
        return
      }
      this.reply.parentId = parentId
      this.reply.replyId = replyId
      this.$emit('onReply', replyTo)
    },
    // cmd : voteup / votedown
    func_vote(comment, cmd) {
      if (comment.voted) return
      this.$Ajax({
        method: 'post', url: `/comments/vote`,
        data: { "commentId": comment.Id, "cmd": cmd, }
      }).then(() => {
        comment.voted = cmd
        comment[cmd]++
      }).catch((http) => {
        this.$emit('onError', http)
      })
    },  
    postComment(content, isReplySubject) {
      this.reply.content = content
      if (!this.islogin || this.reply.content === '') return
      if (isReplySubject === true) {
        this.reply.parentId = 0
        this.reply.replyId = 0
      }
      this.$Ajax({
        method: 'post', url: `/comments/`,
        data: {
          "target_id": this.targetId,
          "parent_id": this.reply.parentId,
          "reply_id": this.reply.replyId,
          "content": this.reply.content,
        }
      }).then((response) => {        
        if (response.data.ret == 1) {
          this.reply.parentId = 0
          this.reply.replyId = 0
          this.reply.content = ''
          this.loadComments(1)
          this.$emit('onPosted', this.targetId)
        } else {
          this.$emit('onError', response.data.msg)
        }
      }).catch((e) => {
        if(e.response.data.msg === 'Invalid token - expired') {
          this.$emit('onError', 'token-expired')
        }else{
          this.$emit('onError', '回复评论出错了:' + e)
        }
      })
    }
  }
}
</script>


