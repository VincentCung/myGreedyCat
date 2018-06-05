// pages/myMapDetail/myMapDetail.js
const config = require('../../config')
const app = getApp();
const util = require('../../utils/util')
Page({
    data: {
        icons: [{
            name: "liked",
            num: 0,
            imageUrl: "../../icons/like.png",
        },
        {
            name: "disliked",
            num: 0,
            imageUrl: "../../icons/dislike.png",
        },
        {
            name: "collected",
            num: 0,
            imageUrl: "../../icons/collect.png",
        }
        ],
        menuItems: [],
        isMenuActive: false,
        description: "",
        comments: [],
        markers: [],
        mapid: null,
        author: null,
        markers: [],
        city: '',
        locality: '',
        modalHidden: true,
        controls:[]
    },
    //菜单点击事件
    menuTap: function (e) {
        this.setData({
            isMenuActive: !this.data.isMenuActive
        })
    },
    //控件点击事件
    lockLocation: function (e) {
        this.mapCtx.moveToLocation()
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
        let configList = this.data.configList  //删除组件外的list
        let index = configList.findIndex((v, i) => v.itemId == e.detail.itemId)
        configList.splice(index, 1);
        this.setData({ configList })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onShow(options) {
        this._checkAuthoryShowModal(this._refreshInfo)
    },

    onLoad() {
        this.mapCtx = wx.createMapContext('myMap')
        let that = this;
        wx.getLocation({
            success: function (res) {
                that.setData({
                    latitude: res.latitude,
                    longitude: res.longitude
                })
            },
        })
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    controls: [{
                        id: 1,
                        iconPath: '../../icons/ui/location.png',
                        position: {
                            left: res.windowWidth - 60,
                            top: 230,
                            width: 50,
                            height: 50
                        },
                        clickable: true
                    }]
                })
            },
        })
    },


    calloutToDetail(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail?hiddenNavigator=1&id=' + e.markerId,
        })
    },

    navigateToDetail(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail?hiddenNavigator=1&id=' + e.currentTarget.dataset.id,
        })
    },

    onPageScroll() {
        this.setData({
            isMenuActive: false
        })
    },
    _dataProcess(rawData) {
        let data = {
            mapid: rawData.mapid,
            map_name: rawData.map_name,
            description: rawData.description,
            province: rawData.province,
            city: rawData.city,
            locality: rawData.locality,
            create_time: rawData.create_time,
            category: rawData.category,
            author_id: rawData.author_id,
            author: rawData.author,
            comments: rawData.comments,
        };
        for (let i=0;i<data.comments.length;i++) {
            if(!data.comments[i].is_public){
                data.comments[i].simple_user_info.nickName='匿名用户'
                data.comments[i].simple_user_info.avatarUrl = '../../icons/mainIcon.png'
            }
        }

        let icons = this.data.icons
        for (let i = 0; i < 3; i++) {
            icons[i].num = rawData['num_' + icons[i].name]
        }
        data.icons = icons


        let length = rawData.coordinates.length
        data.configList = Array.from({
            length
        }, (v, i) => ({
            leftDistance: 0,
            itemId: rawData.coordinates[i].id
        }))

        let markers = changeToMaker(rawData.coordinates);
        
        data.markers = markers;

        return data

    },

    _checkAuthoryShowModal(callback = () => { }) {
        if (app.data.logged && app.data.userAuthory) {
            this.setData({ modalHidden: true })
            callback()
        } else if (!app.data.userAuthory) { //未授权登录
            this.setData({ modalHidden: false })
        }
    },

    confirmAuthory(e) { //确认用户是否有授权
        this.setData({ modalHidden: true })
        var that = this
        if (e.detail.userInfo) { //授权成功登录并更新数据
            app.data.userAuthory = true
            app.login(that._refreshInfo)
        }
    },

    _refreshInfo() {
        this.setData({ mapid: app.data.mainMapId, modalHidden: true })
        if (app.data.mainMapId != null) {
            let menuItems = _getMenuItems()
            this.setData({ menuItems })
            let that = this
            wx.showNavigationBarLoading()
            wx.showLoading({
                title: '加载中',
                mask: true
            })
            wx.request({
                url: config.service.host + '/map/mapDetail',
                data: {
                    mapid: app.data.mainMapId
                },
                success(res) {
                    let data = that._dataProcess(res.data.data.map)
                    that.setData(data)
                    wx.setNavigationBarTitle({
                        title: res.data.data.map.map_name,
                    })
                    wx.hideNavigationBarLoading()
                    wx.hideLoading()
                }, fail(error) {
                    util.showModel('网络错误', '请检查好网络后重试')
                    console.log(error)
                }
            })
        }
    }

})

function changeToMaker(coordinates) {
    let iconPath = "../../icons/location.png";
    let width = 40;
    let height = 40;
    let markers = coordinates.map(function (marker, index) {
        marker.iconPath = iconPath;
        marker.width = width;
        marker.height = height;
        marker.title = marker.name;
        marker.callout = {
            display: "ALWAYS",
            fontSize: 12,
            color: '#ffffff',
            bgColor: '#000000',
            padding: 8,
            borderRadius: 4,
        };
        marker.callout.content = marker.name;
        delete marker.name;

        return marker;
    })
    return markers;
}


function getMapCenter(markers) {
    let center_latitude = 0;
    let center_longitude = 0;
    let num_point = markers.length;
    markers.forEach(function (points, index) {
        center_latitude += points.latitude / num_point;
        center_longitude += points.longitude / num_point;
    })
    let markers_center = {
        center_latitude,
        center_longitude
    }
    return markers_center;
}

function _getMenuItems() {
    return [{
        name: "新的觅食处",
        topDistance: -320,
        iconPath:'../../icons/ui/whiteMarker.png',
        linkUrl: "/pages/newCoordinate/newCoordinate?mapid=" + app.data.mainMapId
    },
    {
        name: "切换地图",
        topDistance: -240,
        iconPath: '../../icons/ui/switch.png',
        linkUrl: "/pages/myMaps/myMaps?choice=0&lockDelete=1"
    },
    {
        name: "管理地图",
        topDistance: -160,
        iconPath: '../../icons/ui/set.png',
        linkUrl: "/pages/mapControl/mapControl?mapid=" + app.data.mainMapId
    },
    {
        name: "新建地图",
        topDistance: -80,
        iconPath: '../../icons/ui/whiteMap.png',
        linkUrl: "/pages/newMap/newMap"
    }
    ]
}