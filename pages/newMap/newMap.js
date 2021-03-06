// pages/newMap/newMap.js

const config = require('../../config')
const util = require('../../utils/util')
const app = getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        mapid: null,
        location: ["北京市", "北京市", "东城区"],
        mapName: '',
        description: '',
        isPublic: true,
        textareaLen: 0,
        textareaMaxLen: 100,
        tags: [{
                tagName: "日韩料理",
                isChoosed: false
            },
            {
                tagName: "西式简餐",
                isChoosed: false
            },
            {
                tagName: "川湘菜",
                isChoosed: false
            },
            {
                tagName: "东南亚风情",
                isChoosed: false
            },
            {
                tagName: "下午茶甜点",
                isChoosed: false
            },
            {
                tagName: "特色私房",
                isChoosed: false
            },
            {
                tagName: "养生早点",
                isChoosed: false
            },
            {
                tagName: "简约小食",
                isChoosed: false
            },
            {
                tagName: "其他",
                isChoosed: false
            }
        ],

    },
    toggleTagState: function (e) {
        let obj = {}
        let index = e.currentTarget.id
        let value = this.data.tags[index].isChoosed
        let key = "tags[" + index + "].isChoosed"
        obj[key] = !value
        this.setData(obj)

    },
    /**
     * 页面提交事件
     */
    formSubmit: function (e) {
        let newMap = e.detail.value
        console.log(newMap)
        if (newMap.mapName == '') {
            util.showModel('提示','地图名不能为空')
        } else {
            wx.showLoading({
                title: '发送中',
                mask:true
            })
            if (this.data.mapid) {
                this._updateRequest(e.detail.value)
            } else {
                this._createRequest(e.detail.value)
            }

        }

    },
    /**
     * picker发生改变
     */
    bindPickerChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            location: e.detail.value
        })
    },
    /**
     * textarea实时更新字数
     */
    bindTextAreaChange: function (e) {
        var that = this
        var len = parseInt(e.detail.value.length)
        that.setData({
            textareaLen: len
        })
    },

    onLoad() {
        if (this.options.mapid) { //更新地图
            let mapid = this.options.mapid
            wx.setNavigationBarTitle({
                title: '管理地图信息',
            })
            this.setData({
                mapid
            })
            this._setLoadDetail()
        } else { //新建地图

        }
    },

    _setLoadDetail() {
        let that = this
        wx.request({
            url: config.service.host + '/map/mapDetail',
            data: {
                mapid: that.options.mapid
            },
            success(res) {
                let rawData = res.data.data.map
                let data = that._dataProcess(rawData)
                that.setData(data)
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })
    },

    _dataProcess(rawData) {
        console.log(rawData)
        let data = {
            mapName: rawData.map_name,
            location: [rawData.province, rawData.city, rawData.locality],
            description: rawData.description,
            textareaLen: rawData.description.length,
            isPublic: !!rawData.is_public
        }
        let index;
        let tags = this.data.tags
        for (let category of rawData.category) {
            console.log(category)
            index = tags.findIndex((v, i) => v.tagName == category)
            if (index != -1) {
                console.log(tags)
                console.log(index)
                tags[index].isChoosed = true
            }

        }
        data.tags = tags
        return data
    },
    _createRequest(rawData) {
        let category = []
        let categories = this.data.tags
        for (let item of categories) {
            if (item.isChoosed) {
                category.push(item.tagName)
            }
        }
        let data = {
            open_id: app.data.userInfo.openId,
            map: {
                map_name: rawData.mapName,
                description: rawData.description,
                province: rawData.location[0],
                city: rawData.location[1],
                locality: rawData.location[2],
                is_public: rawData.isPublic,
                category
            }
        };
        this._dataRequest(data, 0)

    },

    _updateRequest(rawData) {
        let category = []
        let categories = this.data.tags
        for (let item of categories) {
            if (item.isChoosed) {
                category.push(item.tagName)
            }
        }
        let map = {
            map_name: rawData.mapName,
            description: rawData.description,
            province: rawData.location[0],
            city: rawData.location[1],
            locality: rawData.location[2],
            is_public: rawData.isPublic,
            category
        }
        let data = {
            mapid:this.data.mapid,
            map
        }
        this._dataRequest(data, 1)

    },


    _dataRequest(data, choice) {
        let choices = ['POST', 'PUT']
        let method = choices[choice]
        console.log(data)
        wx.request({
            url: config.service.host + '/map/myMap',
            method,
            data,
            success(res) {
                wx.hideLoading()
                if(choice==0) {
                    wx.redirectTo({
                        url: '/pages/mapControl/mapControl?mapid=' + res.data.data.mapid,
                    })
                } else if(choice==1) {
                    wx.navigateBack({
                        
                    })
                }
            }, fail(error) {
                wx.hideLoading()
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })
    
    }
})