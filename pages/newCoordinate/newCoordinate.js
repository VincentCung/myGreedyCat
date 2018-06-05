// pages/newCoordinate/newCoordinate.js

const config = require('../../config')
const util = require('../../utils/util.js')


Page({

    data: {
        categories: ["日韩料理", "西式简餐", "川湘菜", "东南亚风情", "下午茶甜点", "特色私房", "养生早点", "简约小食", "其他"],
        categoryIndex: 0,
        imagePath: null,
        oldPath: null,

        textareaLen: 0,
        textareaMaxLen: 50,

        latitude: 0,
        longitude: 0,
        description: "",
        name: "",
        address: '',
        category: "",
        mapid: null,
        id: null
    },

    chooseCoordinate() {
        let that = this
        wx.chooseLocation({
            success(res) {
                console.log(res)
                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude
                })
                wx.showToast({
                    title: '选择成功',
                    icon:'success'
                })
            }, fail(res) {
                wx.showModal({
                    title: '提示',
                    content: '选择失败',
                    showCancel: false,
                    confirmColor: '#EB6159',
                })
            }
        })
    },

    //页面提交事件
    formSubmit(e) {
        if (e.detail.value.name == '') {
            wx.showModal({
                title: '提示',
                content: '觅食处不能没有名字哦',
                showCancel: false,
                confirmColor: '#EB6159'
            })
        } else {
            if (this.options.id) {
                this._updateRequest(e.detail.value)
            } else {
                this._createRequest(e.detail.value)
            }
        }

    },

    //生命周期函数--监听页面加载

    onLoad(options) {

        if (this.options.id) { //更新坐标
            let id = this.options.id
            this.setData({ id })
            this._setLoadDetail()
        } else { //新建坐标
            let mapid = this.options.mapid
            this.setData({ mapid })
            let that = this
            wx.getLocation({
                success(res) {
                    that.setData({
                        latitude:res.latitude,
                        longitude:res.longitude
                    })
                },
            })
        }
    },

    bindTextAreaChange(e) {
        var that = this
        var len = parseInt(e.detail.value.length)
        that.setData({ textareaLen: len })
    },

    chooseImage(e) {
        var that = this;
        wx.chooseImage({
            count: 1,
            success(res) {
                that.setData({
                    imagePath: res.tempFilePaths[0]
                });
            }
        })
    },

    bindCategoryChange(e) {
        this.setData({
            categoryIndex: e.detail.value
        })
    },
    _setLoadDetail() {
        let that = this
        wx.request({
            url: config.service.host + '/map/coordinate',
            data: {
                coordinateId: that.options.id
            },
            success(res) {
                let rawData = res.data.data.coordinate
                let data = that._dataProcess(rawData)
                that.setData(data)
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })
    },


    _dataProcess(rawData) {
        let categories = this.data.categories
        let categoryIndex = categories.indexOf(rawData.category)

        let data = {
            name: rawData.name,
            address: rawData.address,
            description: rawData.description,
            latitude: rawData.latitude,
            longitude: rawData.longitude,
            imagePath: rawData.main_image_url,
            oldPath: rawData.main_image_url,
            mapid: rawData.mapid,
            categoryIndex,
            textareaLen: rawData.description.length
        }

        return data
    },


    _createRequest(rawData) {
        let categories = this.data.categories
        let data = {
            name: rawData.name,
            address: rawData.address,
            description: rawData.description,
            mapid: Number(this.data.mapid),
            longitude: this.data.longitude,
            latitude: this.data.latitude,
            category: categories[rawData.categoryIndex]
        }
        let that = this
        if (this.data.oldPath != this.data.imagePath) {
            let filePath = this.data.imagePath
            wx.uploadFile({
                url: config.service.uploadUrl,
                filePath,
                name: 'file',

                success: function (res) {
                    res = JSON.parse(res.data)
                    data.main_image_url = res.data.imgUrl
                    that._dataRequest(data, 0)
                },

                fail: function (e) {
                    util.showModel('提示', '上传图片失败,请重新选择后重试')
                }
            })
        } else {
            this._dataRequest(data, 0)
        }
    },

    _updateRequest(rawData) {
        let categories = this.data.categories
        let coordinate = {
            name: rawData.name,
            address: rawData.address,
            description: rawData.description,
            mapid: Number(this.data.mapid),
            longitude: this.data.longitude,
            latitude: this.data.latitude,
            category: categories[rawData.categoryIndex]
        }
        let data = {
            coordinate_id: this.options.id,
            coordinate
        }
        let that = this
        if (this.data.oldPath != this.data.imagePath) {
            let filePath = this.data.imagePath
            wx.uploadFile({
                url: config.service.uploadUrl,
                filePath,
                name: 'file',

                success: function (res) {
                    res = JSON.parse(res.data)
                    data.coordinate.main_image_url = res.data.imgUrl
                    that._dataRequest(data, 1)
                },

                fail: function (e) {
                    util.showModel('提示', '上传图片失败,请重新选择后重试')
                }
            })
        } else {
            this._dataRequest(data, 1)
        }
    },


    _dataRequest(data, choice) {
        let choices = ['POST', 'PUT']
        let method = choices[choice]
        console.log(data)
        wx.request({
            url: config.service.host + '/map/coordinate',
            method,
            data,
            success() {
                wx.navigateBack({

                })
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })
    }

})