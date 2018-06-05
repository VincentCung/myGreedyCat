// pages/chooseCity/chooseCity.js

const map = require('../../vendor/qqmap-wx-jssdk.min.js')
const util = require('../../utils/util')

const app = getApp()

const mapkey = 'LREBZ-DKOKU-6GIVF-BOXUR-W6HWZ-LLBBI'
const mapsdk = new map({ key: mapkey })


Page({

    data: {
        hotCity: ["全国","北京", "上海", "广州", "深圳", "成都", "杭州","重庆","西安"],
        toID: "hot"
    },

    onLoad: function (options) {
        var that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    systemInfo: res
                })
            }
        })
        wx.showLoading({
            title: '加载城市列表中',
            mask: true
        })
        mapsdk.getCityList({
            success(res){
                    that._cityProcess(res.result)
                    wx.hideLoading()
            },
        })

        
    },

    _cityProcess(result) {
        let resultList = [...result[0],...result[1]]
        resultList.sort((a, b) => (a.pinyin[0].localeCompare(b.pinyin[0])))
        let cityList = [], cityGroup;
        for (let city of resultList) {
            cityGroup = cityList.find((value) => value.name == city.pinyin[0][0].toUpperCase());
            if (!cityGroup) {
                var arr = [];
                arr.push(city.name);
                var obj = {};
                obj.name = city.pinyin[0][0].toUpperCase();
                obj.list = arr;
                cityList.push(obj);
            } else if (cityGroup && !cityGroup.list.find((value) => value == city.name)){
                cityGroup.list.push(city.name);
            }
        };
        this.setData({
            cityList: cityList
        })
    },

    scrollTo(e) {
        wx.showToast({
            title: e.target.dataset.choice == "hot" ? "热门城市" : e.target.dataset.choice,
            icon: "none"
        })
        this.setData({
            toID: e.target.dataset.choice
        })
    },

    chooseCity(e) {
        app.data.city = e.target.dataset.city
        wx.switchTab({
            url: '../index/index',
        })

    }


})