// pages/myMaps/myMaps.js
const config = require('../../config')
const app = getApp()
Page({

    data: {
        choice: null,
        mapList: [],
        lockDelete:false,
        configList:[]
    },
    //主页面处理删除事件的数据同步
    onDeleteItem(e) {
        let choices = ['/map/myMap', '/user/collectedMap']
        let choice = choices[this.options.choice]

        wx.request({
            url: config.service.host + choice,
            method: 'DELETE',
            data: {
                open_id: app.data.userInfo.openId,
                mapid: e.detail.itemId
            },
            success() {
                wx.showToast({
                    icon:'success',
                    title: '删除成功',
                })
                if (e.detail.itemId == app.data.mainMapId) {
                    app.data.mainMapId = null
                }
            }
        })
        let configList = this.data.configList  //删除组件外的list
        let index = configList.findIndex((v, i) => v.itemId == e.detail.itemId)
        configList.splice(index, 1);
        console.log(configList)
        this.setData({ configList })

    },

    onShow: function (options) {
        let {choice,lockDelete} = this.options
        this.setData({ choice ,lockDelete:!!lockDelete})
        let that = this
        let choices = ['mapList', 'collectedMapList']
        choice = choices[this.options.choice]
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.request({
            url: config.service.host + "/user/" + choice,
            data: {
                openId: app.data.userInfo.openId
            },
            success(res) {
                let length = res.data.data.maps.length
                let mapList = res.data.data.maps
                that._setConfigList(length, mapList)
                that.setData({
                    mapList: res.data.data.maps
                })
                wx.hideLoading()
            }

        })
    },
    onTap(e) {
        let choices = ['/mapControl','/mapDetail']
        let choice = choices[this.options.choice]
        let url = '/pages'
        url += choice
        url += choice
        url +='?mapid='+e.target.dataset.id
        wx.navigateTo({
            url
        })
    },
    _setConfigList(length, list) {
        let configList = Array.from({ length }, (v, i) => ({ leftDistance: 0, itemId: list[i].mapid }))
        this.setData({
            configList
        })
    },
    chooseMap(e) {
        wx.request({
            url: config.service.host +'/user/setMainMap',
            method:'POST',
            data:{
                open_id: app.data.userInfo.openId,
                main_mapid: e.target.dataset.id
            },
            success(){
                wx.navigateBack({})
                app.data.mainMapId = e.target.dataset.id
            }
        })
    }
})