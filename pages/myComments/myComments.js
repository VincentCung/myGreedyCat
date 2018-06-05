// pages/myComments/myComments.js

const config = require('../../config')
const app = getApp()
const util = require('../../utils/util')
Page({

    data: {
        commentList: [],
        configList: []
    },

    onLoad: function (options) {
        let that = this
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.request({
            url: config.service.host + "/user/comment",
            data: {
                openId: app.data.userInfo.openId
            },
            success(res) {
                let length = res.data.data.comments.length
                let commentList = res.data.data.comments
                that._setConfigList(length, commentList)
                that.setData({
                    commentList
                })
                wx.hideLoading()
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }

        })
    },

    onDeleteItem(e) {
        wx.request({
            url: config.service.host + "/user/comment",
            method: 'DELETE',
            data: {
                comment_id: e.detail.itemId
            },
            success() {
                wx.showToast({
                    icon: 'success',
                    title: '删除成功',
                })
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })
        let configList = this.data.configList  //删除组件外的list
        let index = configList.findIndex((v, i) => v.itemId == e.detail.itemId)
        configList.splice(index, 1);
        console.log(configList)
        this.setData({ configList })
    },

    _setConfigList(length, list) {
        let configList = Array.from({ length }, (v, i) => ({ leftDistance: 0, itemId: list[i].id }))
        this.setData({
            configList
        })
    }
})