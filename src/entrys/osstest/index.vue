<template>
    <div style="text-align:center;margin-top:100px;">
        <input ref="imagefile" type="file" accept="image/gif, image/jpeg, image/png" @change="file_onChange()">
        <br><br><br><br>
        <v-btn color="primary" @click="btn_click()">上传</v-btn>
        <br><br>
        <br><br>      
        <div>
            <p v-for="(item,index) in log" :key="index">{{ item }}</p>
        </div>
    </div>
</template>

<script>
import { VBtn } from 'vuetify/lib'
import AliOss from 'ali-oss'
import { async } from 'q'

export default {
    components: {
         VBtn
    },
    data() {
        return {
            file: null,
            ext: '',
            log: []
        }
    },
    created() {
        let _this = this
        console.log = function(obj) {
            _this.log.push(String((obj)))
        }
        console.error = console.log
        console.warn = console.log
        console.debug = console.log
        console.debug('created')
    },
    methods: {
        file_onChange() {
            this.file = this.$refs['imagefile'].files[0]
            // this.url = window.URL.createObjectURL(this.file)
            this.ext = this.file.name.split('.').pop().toLowerCase()
        },
        btn_click: async function() {
            const client = new AliOss({
                region: "oss-cn-shanghai",
                accessKeyId: "LTAIHMSR3i94XGvl",
                accessKeySecret: "kJZ7VOwgUpxlCR88Ls27rjOtm0gNn8",
                bucket: "nij20190123",
                secure: true
            })
            let fid = new Date().getTime()
            await client.put(`/test/${fid}.${this.ext}`, this.file).then((result)=>{
                console.log(result)
            }).catch((e)=>{
                console.log(e)
            })

            console.log('finish')            
        }
    }
}
</script>