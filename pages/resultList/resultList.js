// pages/resultList/resultList.js

const config = require('../../config')
Page({

    data: {
        tabs: ["匹配地图", "匹配店铺"],
        activeIndex: 0,
        sliderOffset: 0,

        //mapList
        maps: [],
        mapOffset: 0,
        
        coordinates: [],
        coordinateOffset: 0,
        isEnd: [false,false],

        keyword: undefined,
        category: undefined,
        locality: undefined
    },

    onLoad() {
        this.setData({
            keyword: this.options.keyword || '',
            category: this.options.category || '',
            locality: this.options.locality || ''
        })
        if(this.options.category) {
            let title = this.options.category
            wx.setNavigationBarTitle({
                title
            })
        }
        this._loadMapList()
        this._loadCoordinateList()
    },
    onReachBottom() {
        let index = this.data.activeIndex
        if (!this.data.isEnd[index]) {
            switch (this.data.activeIndex) {
                case 0:
                    this._loadMapList();
                    break;
                case 1:
                    this._loadCoordinateList();
                    break;
                default:
                    break;
            }
        }
    },
    //navbar切换部分
    tabClick(e) {
        this.setData({
            sliderOffset: e.currentTarget.offsetLeft,
            activeIndex: e.currentTarget.dataset.index
        });
    },

    //获得列表
    _loadMapList(limit = 5) {
        let that = this
        let data = this._dataProcess()
        data.offset = this.data.mapOffset
        wx.showNavigationBarLoading()
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.request({
            url: config.service.host + '/map/mapList',
            data,
            success(res) {
                let result = {}
                result.maps = that.data.maps.concat(res.data.data.maps)
                result.mapOffset = that.data.mapOffset + res.data.data.maps.length
                if (res.data.data.maps.length < limit) {
                    let isEnd = that.data.isEnd
                    isEnd[0] = true
                    result.isEnd = isEnd
                }
                that.setData(result)
                wx.hideNavigationBarLoading()
                wx.hideLoading()
            }
        })
    },

    _loadCoordinateList(limit = 5) {
        let that = this
        let data = this._dataProcess()
        data.offset = this.data.coordinateOffset
        wx.showNavigationBarLoading()
        wx.showLoading({
            title: '加载中',
            mask: true
        })
        wx.request({
            url: config.service.host + '/map/coordinateList',
            data,
            success(res) {
                let result = {}
                result.coordinates = that.data.coordinates.concat(res.data.data.coordinates)
                result.coordinateOffset = that.data.coordinateOffset + res.data.data.coordinates.length
                if (res.data.data.coordinates.length < limit) {
                    let isEnd = that.data.isEnd
                    isEnd[1] = true
                    result.isEnd = isEnd
                }
                that.setData(result)
                wx.hideNavigationBarLoading()
                wx.hideLoading()
            }
        })
    },

    _dataProcess() {
        let data = {}
        let { category, keyword, locality } = this.data
        if (category) {
            data.category = category
        }
        if (keyword) {
            data.keyword = keyword
        }

        if (locality && locality != '全国') {
            data.locality = locality
        }

        return data;
    } ,
    searchInput(e) {
        if (e.detail.value) {
            this.setData({
                keyword:e.detail.value,
                maps: [],
                mapOffset: 0,
                coordinates: [],
                coordinateOffset: 0,
                isEnd: [false, false],
            })
            this._loadMapList()
            this._loadCoordinateList()
        }
    }
})