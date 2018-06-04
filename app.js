 //app.js

const qcloud = require('./vendor/wafer2-client-sdk/index')
const config = require('./config')
const util = require('./utils/util')

App({
    data: {
        userInfo: {},   
        logged: false,  //用户是否登录
        userAuthory: false, //用户是否授权用户信息
        numbers: [0, 0, 0], //依次为点赞踩收藏数目
        mainMapId:null,
        city:'全国'
    },
    onLaunch: function () {
        qcloud.setLoginUrl(config.service.loginUrl)
        var that = this
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                    that.login()
                    that.data.userAuthory = true
                } else {
                    that.data.userAuthory = false
                }
            }
        })
    },
    login(callback = () => { }) {  //用户登录流程 
        if (this.data.logged) return

        util.showLoding('正在登录')
        var that = this

        // 调用登录接口
        qcloud.login({
            success(result) {
                if (result) {
                    util.showSuccess('登录成功')
                    that.data.userInfo = result
                    that.data.logged = true
                    that._saveUserInfo(callback)
                } else {
                    // 如果不是首次登录，不会返回用户信息，请求用户信息接口获取
                    qcloud.request({
                        url: config.service.requestUrl,
                        login: true,
                        success(result) {
                            if (result.statusCode == 200) {
                                util.showSuccess('登录成功')
                                that.data.userInfo = result.data.data
                                that.data.logged = true
                                that._saveUserInfo(callback)
                                
                            } else {
                                util.showModel('请求失败', '请稍后重试,错误代码：' + result.statusCode)
                            }
                        },
                        fail(error) {
                            util.showModel('请求失败', error.message)
                        }
                    })
                }
            },
            fail(error) {
                util.showModel('登录失败', error.message)
                console.log(error)
            }
        })
    },
    _saveUserInfo(callback = () => { }) { //发送请求保存信息 并获得各种数
        let that = this;
        let userInfo = this.data.userInfo
        wx.request({
            url: config.service.host + '/user/save',
            method: 'POST',
            data: {
                openId: userInfo.openId,
                nickName: userInfo.nickName,
                avatarUrl: userInfo.avatarUrl
            },
            success(res) {
                if(res.data.code==0){
                    console.log(res)
                    that.data.numbers = res.data.data.numbers
                    that.data.mainMapId = res.data.data.mainMapId
                    callback()
                    if(res.data.data.firstLogin){
                        wx.navigateTo({
                            url: '/pages/help/help',
                        })
                    }
                } 
            },
            fail(res) {
                util.showModel('提示', '网络错误，请检查你的网络后重试')
            }
        })
    }

})