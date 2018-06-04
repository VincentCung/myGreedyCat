 // pages/index/index.js

const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config')
const util = require('../../utils/util')
const map = require('../../vendor/qqmap-wx-jssdk.min.js')
const app = getApp()

const mapkey = 'LREBZ-DKOKU-6GIVF-BOXUR-W6HWZ-LLBBI'
const mapsdk = new map({ key: mapkey })

let iconPath = "../../icons/category/"

Page({

    data: {
        //position
        city: "全国",

        //categories
        categories: [
            { name: "日韩料理", imageSrc: iconPath +"Japanese.png" },
            { name: "西式简餐", imageSrc: iconPath +"western.png" },
            { name: "川湘菜", imageSrc: iconPath +"ChuanXiang.png" },
            { name: "东南亚风情", imageSrc: iconPath +"Southeast_Asia.png" },
            { name: "更多", imageSrc: iconPath +"else.png", url: "../categories/categories" }
        ],

        //swiper
        imageUrls: [
            '../../icons/ads-01.png',
            '../../icons/ads-01.png',
            '../../icons/ads-01.png'
        ],


        //navbar
        tabs: ["最多like", "最新", "最热"],
        activeIndex: 0,
        sliderOffset: 0,

        //mapList
        likeList: [],
        likeOffset: 0,
        likeIsEnd: false,
        timeList: [],
        timeOffset: 0,
        timeIsEnd: false,
        hotList: [],
        hotOffset: 0,
        hotIsEnd: false,

        keyword:'',
        inputShowed:false
    },

    onShow() {
        if (app.data.city!=this.data.city) {
            this.setData({ city: app.data.city })
            this._reLoadList()
        } 
        if(this.data.keyword!='') {
            this._refreshSearchBar()
        }
    },

    onLoad() {
        var that = this

        //获得当前位置
        util.checkLocationAuth((success) => {
            if (success) { //已授权或允许授权
                that.confirmLocation()
            } else {
                util.showModel('提示', '您关闭了定位信息，部分功能将受到限制，若要重新授权请按如下步骤\n右上角"···"->"关于"->右上角"···"->设置')
                that._reLoadList()
            }
        })

    },

    onReachBottom() {
        let order = ['like', 'time', 'hot']
        order = order[this.data.activeIndex]
        if (!this.data[order + 'IsEnd']) {
            this._loadList(order)
        }
    },

    onPullDownRefresh() {
        this._reLoadList()
    },
    
    //输入搜索
    searchInput(e) {
        if(e.detail.value){
            let url = '../resultList/resultList'
            url += '?keyword=' + e.detail.value
            if(this.data.city!='全国'){
                url +='&locality='+this.data.city
            }
            wx.navigateTo({
                url
            }),
            this.setData({
                keyword:e.detail.value
            })
        }
    },

    //navbar切换部分
    tabClick(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.dataset.index
        });
    },
    //获得本地所在城市
    confirmLocation() {
        var that = this
        mapsdk.reverseGeocoder({
            success: (res) => {
                var city = res.result.address_component.city
                city = city.replace(/市/, '')
                city = city.replace(/特别行政区/, '')
                that.setData({
                    city
                })
                app.data.city = city
                that._reLoadList()
            }
        })
    },
    //获得地图列表
    _loadList(order, limit = 5) {
        let that = this
        let data = {}
        data.offset = this.data[order + 'Offset']
        data.limit = limit
        data.order = order
        if(this.data.city!='全国'){
            data.locality = this.data.city
        }
         
        wx.request({
            url: config.service.host + '/map/mapList',
            data,
            success(res) {
                let maps = {}
                maps[order + 'List'] = that.data[order + 'List'].concat(res.data.data.maps)
                maps[order + 'Offset'] = that.data[order + 'Offset'] + res.data.data.maps.length
                if (res.data.data.maps.length < limit) {
                    maps[order + 'IsEnd'] = true
                }
                that.setData(maps)

            }
        })
    },
    _refreshSearchBar() {
        this.setData({
            keyword:'',
            inputShowed : false
        })
    },

    _refreshMapList() {
        this.setData({
            likeList: [],
            likeOffset: 0,
            likeIsEnd: false,
            timeList: [],
            timeOffset: 0,
            timeIsEnd: false,
            hotList: [],
            hotOffset: 0,
            hotIsEnd: false,
        })
    },

    _reLoadList() {
        this._refreshMapList()
        this._loadList('like')
        this._loadList('time')
        this._loadList('hot')
    }

    

})
