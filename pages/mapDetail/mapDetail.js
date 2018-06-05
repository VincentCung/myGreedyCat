// pages/mapDetail/mapDetail.js
const config = require('../../config');
const util = require('../../utils/util')
const app = getApp();
Page({


    data: {
        icons: [{
            name: "liked",
            num: 0,
            activeImageUrl: "../../icons/like.png",
            inactiveImageUrl: "../../icons/likeNot.png",
            isActive: false
        },
        {
            name: "disliked",
            num: 0,
            activeImageUrl: "../../icons/dislike.png",
            inactiveImageUrl: "../../icons/dislikeNot.png",
            isActive: false
        },
        {
            name: "collected",
            num: 0,
            activeImageUrl: "../../icons/collect.png",
            inactiveImageUrl: "../../icons/collectNot.png",
            isActive: false
        }
        ],
        mapid: "",
        map_name: "",
        description: "",
        province: "",
        city: "",
        locality: "",
        create_time: "",
        category: "",
        author_id: "",
        main_image_url: "",
        author: {},
        markers: [],
        comments: [],
        controls: []
    },
    //icon点击事件
    iconTap: function (e) {
        if (app.data.logged && app.data.userAuthory) {
            let data = this._getAdmirationData(e.currentTarget.dataset.index)
            let that = this
            wx.request({ //返回给数据库
                url: config.service.host + "/user/admiration",
                method: "POST",
                data,
                success: function (res) {
                    that._showAdmirationTip(e.currentTarget.dataset.index)
                }, fail(error) {
                    util.showModel('网络错误', '请检查好网络后重试')
                    console.log(error)
                }
            })
        } else if (!app.data.userAuthory) { //未授权登录
            wx.showModal({
                title: '提示',
                content: '你尚未授权或登陆，操作无效',
                showCancel: false,
                confirmColor: "#EB6159",
            })
        }

    },

    _showAdmirationTip(index) {
        let title;
        switch (index) {
            case 0:
                title = '点赞成功';
                break;
            case 1:
                title = '点踩成功';
                break;
            case 2:
                title = '收藏成功';
                break;
        }
        if (!this.data.icons[index].isActive) {
            title = '取消' + title
        }
        wx.showToast({
            icon: 'success',
            title
        })
    },

    _getAdmirationData(index) {
        let icons = this.data.icons;
        icons[index].isActive = !icons[index].isActive;
        let change = icons[index].isActive ? 1 : -1;
        icons[index].num = icons[index].num + change;
        this.setData({
            icons
        })
        let data = {
            open_id: app.data.userInfo.openId,
            mapid: this.options.mapid,
            liked: icons[0].isActive,
            disliked: icons[1].isActive,
            collected: icons[2].isActive
        }
        return data;
    },
    //控件点击事件
    lockLocation: function (e) {
        console.log(e)
        this.mapCtx.moveToLocation()
    },
    //新建评论
    newComment: function (e) {
        wx.navigateTo({
            url: '/pages/comment/comment?mapid=' + this.options.mapid
        })
    },

    onShow: function () {
        let mapid = this.options.mapid
        let that = this
        wx.request({
            url: config.service.host + '/map/comments',
            data: {
                mapid
            },
            success(res) {
                let comments = res.data.data.comments
                console.log(comments)
                for (let i = 0; i < comments.length; i++) {
                    if (!comments[i].is_public) {
                        comments[i].simple_user_info.nickName = '匿名用户'
                        comments[i].simple_user_info.avatarUrl = '../../icons/mainIcon.png'
                    }
                }
                that.setData({
                    comments
                })
            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
        })


    },

    onLoad: function (options) {
        this.mapCtx = wx.createMapContext('myMap') //地图组件设置
        let that = this;
        let mapid = options.mapid;
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.showNavigationBarLoading()
        wx.request({
            url: config.service.host + "/map/mapDetail",
            data: {
                mapid,
                openId: app.data.userInfo.openId
            },
            success(res) {
                let data = that._processData(res.data.data.map)
                //设置标题栏title
                wx.setNavigationBarTitle({
                    title: data.map_name
                })
                that.setData(data)
                wx.hideLoading()
                
                wx.hideNavigationBarLoading()                    

            }, fail(error) {
                util.showModel('网络错误', '请检查好网络后重试')
                console.log(error)
            }
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

    navigateToDetail(e) {
        wx.navigateTo({
            url: '/pages/shopDetail/shopDetail?id=' + e.markerId,
        })
    },
    onShareAppMessage(res) {
        let that = this;
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: that.data.map_name,
            path: '/page/mapDetail/mapDetail?mapid=' + that.options.mapid
        }

    },
    /**
     * 页面滚动响应
     */
    onPageScroll() {
        this.setData({
            isMenuActive: false
        })
    },

    _processData(rawData) {
        console.log(rawData)
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
        }
        let icons = this.data.icons
        for (let i = 0; i < 3; i++) {
            icons[i].num = rawData['num_' + icons[i].name]
            if (rawData.admiration[0]) {
                icons[i].isActive = !!rawData.admiration[0][icons[i].name]
            }
        }
        data.icons = icons

        let markers = changeToMaker(rawData.coordinates);
        data.markers = markers;
        console.log(markers.length)
        if (markers.length > 0) {
            let map_center = getMapCenter(markers);
            data.longitude = map_center.center_longitude
            data.latitude = map_center.center_latitude
        } else {
            let that = this
            wx.getLocation({
                success: function (res) {
                    that.setData({
                        latitude: res.latitude,
                        longitude: res.longitude
                    })
                },
            })
        }


        return data;
    }
})

function changeToMaker(coordinates) {
    let callout = {
        content: '我是这个气泡',
        display: "ALWAYS",
        fontSize: 12,
        color: '#ffffff',
        bgColor: '#000000',
        padding: 8,
        borderRadius: 4,
    };
    let iconPath = "../../icons/location.png";
    let width = 40;
    let height = 40;
    let markers = coordinates.map(function (marker, index) {
        marker.iconPath = iconPath;
        marker.width = width;
        marker.height = height;
        marker.title = marker.name;
        marker.callout = callout;
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