// pages/mapControl/mapControl.js
const config = require('../../config')
const util = require('../../utils/util')
const app = getApp();
const defaultImage = '../../icons/lost.png'

Page({


    data: {
        chooseIndex: 0,
        oldChooseIndex: 0,
        imageList: [defaultImage],
        coordinates: [],
        configList: [],
        mapid: null,
    },

    onShow: function (options) {
        let that = this
        wx.showNavigationBarLoading()
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.request({
            url: config.service.host + '/map/coordinates',
            data: {
                mapid: that.options.mapid
            },
            success(res) {
                let data = that._dataProcess(res.data.data)
                that.setData(data)
                console.log(data)
                wx.hideNavigationBarLoading()
                wx.hideLoading()
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })
    },
    onUnload() {
        let {oldChooseIndex,chooseIndex,imageList} =this.data
        if(oldChooseIndex!=chooseIndex){
            let mapid = this.options.mapid
            let main_image_url;
            if(chooseIndex==0) {
                main_image_url=null
            } else {
                main_image_url=imageList[chooseIndex]
            }
            wx.request({
                url: config.service.host+'/map/setMainImage',
                method:'POST',
                data:{
                    mapid,
                    main_image_url
                }, fail(error) {
                    util.showModel('网络错误', '请检查好网络后重试')
                    console.log(error)
                }
            })
        }
    }
    
    ,

    _dataProcess(rawData) {
        let data = {}
        let length = rawData.coordinates.length
        data.mapid = this.options.mapid
        data.coordinates = rawData.coordinates
        data.imageList = this.data.imageList
        for (let coordinate of data.coordinates) {
            let url = coordinate.main_image_url
            if (url && data.imageList.indexOf(url) == -1) {
                data.imageList.push(url)
            }
        }

        data.configList = Array.from({
            length
        }, (v, i) => ({
            leftDistance: 0,
            itemId: rawData.coordinates[i].id
        }))



        let imagePath = rawData.main_image_url
        console.log(rawData)
        if (imagePath == null) {
            data.oldChooseIndex = 0
            data.chooseIndex = 0
        } else {
            
            let index = data.imageList.indexOf(imagePath)
            console.log(index)
            data.oldChooseIndex = index;
            data.chooseIndex = index
        }

        return data
    },
    onDeleteItem(e) {
        wx.request({
            url: config.service.host + '/map/coordinate',
            method: 'DELETE',
            data: {
                coordinate_id: e.detail.itemId
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
        let { configList, imageList, coordinates } = this.data  //删除组件外的list
        let index = configList.findIndex((v, i) => v.itemId == e.detail.itemId)
        configList.splice(index, 1);
        let imageUrl = coordinates.find((v, i) => v.id == e.detail.itemId)
        if (imageUrl) {
            index = imageList.findIndex((v, i) => v == imageUrl)
            imageList.splice(index, 1)
            this.setData({ chooseIndex: 0 })
        }

        this.setData({ configList, coordinates, imageList })
    },
    chooseImage(e) {
        this.setData({ chooseIndex: e.target.dataset.index })
    },
    mapSwitch() {
        if (app.data.mainMapId == this.options.mapid) {
            wx.showModal({
                title: '提示',
                content: '当前地图已在使用中',
                confirmColor: "#EB6159",
                showCancel: false
            })
        } else {
            let mapid = this.options.mapid
            wx.showModal({
                title: '提示',
                content: '是否使用当前地图',
                confirmColor: "#EB6159",
                success(res) {
                    if (res.confirm) {
                        wx.request({
                            url: config.service.host + '/user/setMainMap',
                            method: 'POST',
                            data: {
                                open_id: app.data.userInfo.openId,
                                main_mapid: mapid
                            },
                            success() {
                                app.data.mainMapId = mapid;
                                wx.showToast({
                                    icon: 'success',
                                    title: '切换成功',
                                })
                            }, fail(error) {
                                util.showModel('网络错误', '请检查好网络后重试')
                                console.log(error)
                            }
                        })
                    }
                }

            })
        }

    },

    newCoordinate() {
        let mapid = this.data.mapid
        wx.navigateTo({
            url: '/pages/newCoordinate/newCoordinate?mapid=' + mapid,
        })
    },

    deleteMap() {
        let mapid = this.data.mapid
        wx.showModal({
            title: '提示',
            content: '确定删除本地图吗？',
            confirmColor: '#EB6159',
            success(res) {
                if (res.confirm) {
                    wx.request({
                        url: config.service.host + '/map/myMap',
                        method: 'DELETE',
                        data: {
                            mapid,
                            open_id: app.data.userInfo.openId
                        },
                        success() {
                            console.log(res)
                            if (mapid == app.data.mainMapId) {
                                app.data.mainMapId = null
                            }
                            wx.navigateBack({
                            })
                        }, fail(error) {
                            util.showModel('网络错误', '请检查好网络后重试')
                            console.log(error)
                        }
                    })
                }
            }
        })

    },

    coordinateControl(e) {
        wx.navigateTo({
            url: '/pages/newCoordinate/newCoordinate?id=' + e.currentTarget.dataset.id,
        })
    },
    informationManage() {
        wx.navigateTo({
            url: '/pages/newMap/newMap?mapid=' + this.options.mapid,
        })
    }
})

