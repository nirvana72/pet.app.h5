import store from '@/store.js'

// yyyy-dd-mm HH:mm:ss
export function passTimeFormat(timeStr){
  timeStr = timeStr.replace(/-/g,'/'); 
  var timestamp = Math.round(Date.parse(timeStr) / 1000);
  var mistiming = Math.round(new Date() / 1000)-timestamp;
  var arrr = ['年','个月','星期','天','小时','分钟','秒'];
  var arrn = [31536000,2592000,604800,86400,3600,60,1];
  for(var i=0;i<=6;i++){
      var inm = Math.floor(mistiming/arrn[i]);
      if(inm!=0){
          return inm+arrr[i]+'前';
      }
  }
}

export const articleConvert = {
  // \r\n换行转 br
  rn2htmlbr: function(str) {
    str = str.replace(/\r\n/g, '<br/>')
    str = str.replace(/\n/g, '<br/>')
    return str
  },
  // 生成OSS地址
  ossPath: function(writetime, AId, fname, host = true) {
    const yyyymm = writetime.replace(new RegExp(/(-)/g), '').substr(0, 6)
    let path = `/articles/${yyyymm}/${AId}/${fname}`
    if (host) {
      path = store.getters.config.oss_host + path
    }
    return path
  },
  // 生成头像地址
  avatarPath: function(avatar, thumb = true) {
    avatar = Number(avatar)
    let url = ''
    if (avatar < 100) {
      url = `${store.getters.config.oss_host}/avatar/${avatar}.png`
    } else {
      const groupId = Math.floor(avatar / 1000) * 1000
      url = `${store.getters.config.oss_host}/avatar/${groupId}/${avatar}.png`
    }
    url += '?x-oss-process=style/' + (thumb ? 'thumb100_100' : 'avatar')

    if (avatar > 100 && avatar == store.getters.session.avatar) {
      url += '&v=' + store.getters.session.time
    }
    return url
  },
  AliOssThumb: {
    'avatar': '?x-oss-process=style/avatar',
    'video': '?x-oss-process=video/snapshot,t_1000,m_fast',
    'img1': '?x-oss-process=style/thumb300_180',
    'img2': '?x-oss-process=style/thumb150_120',
    'img3': '?x-oss-process=style/thumb100_100'
  },
  // 图片组排版
  _ImagesGridStyle: {
    img1: null,
    img2: null,
    img3: null,
  },
  imageStyle: function(len) {
    len = Math.min(3, len)
    if (this._ImagesGridStyle['img' + len] === null) {
      let width = store.getters.device.width      
      width = width - 20 * 2 - (len - 1) * 3 //左右20， 2，3张图左5
      width = Math.floor(width / len)
      let height = width
      if (len === 2) height = Math.floor(height * 0.8)
      if (len === 1) height = Math.floor(height * 0.6)
      this._ImagesGridStyle['img' + len] = {
        width: width + 'px',
        height: height + 'px',
      }
    }
    return this._ImagesGridStyle['img' + len]
  },
  //把过去的秒数转换成 多少时间前
  durationString(duration) {
    let hour = Math.floor(duration / 3600)
    let minute = Math.floor((duration % 3600) / 60)
    let second = duration % 60
    var str = ""
    if (hour > 0) {
        str += `${hour}:`
    }

    if (minute < 10) {
      str += `0${minute}:`
    } else {
      str += `${minute}:`
    }

    if (second < 10) {
      str += `0${second}`
    } else {
      str += `${second}`
    }
    return str
  }
}
