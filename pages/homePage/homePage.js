// pages/homePage/homePage.js
const app = getApp()
const iconPath = '../../icons/ui/'

Page({
    data: {
        avatarUrl: "../../icons/user-unlogin.png",
        nickName: "流浪猫",
        icons: [
            { name: "likes", num: 0, imageUrl: "../../icons/like.png" },
            { name: "dislikes", num: 0, imageUrl: "../../icons/dislike.png" },
            { name: "collections", num: 0, imageUrl: "../../icons/collect.png" }],
        linksList: [
            { name: "我的地图", linkUrl: "/pages/myMaps/myMaps?choice=0", iconSrc: iconPath + 'map.png' },
            { name: "我的评论", linkUrl: "/pages/myComments/myComments", iconSrc: iconPath + 'comment.png' },
            { name: "收藏地图", linkUrl: "/pages/myMaps/myMaps?choice=1", iconSrc: iconPath + 'collect.png' },
        ],
        otherList: [
            { name: "帮助", linkUrl: "#", iconSrc: iconPath + 'help.png' }
        ],
        modalHidden: true
    },


    onShow() { //每次显示刷新一下数据 防止头像加载失败
        this._checkAuthoryShowModal(this._refreshInfo)
    },

    onClose() { this.setData({ modalHidden: true }) },

    _refreshInfo() { //刷新数据
        let userInfo = app.data.userInfo
        let numbers = app.data.numbers
        let icons = this.data.icons
        icons.map((item, index) => { item.num = numbers[index] })
        this.setData({
            avatarUrl: userInfo.avatarUrl,
            nickName: userInfo.nickName,
            icons,
            modalHidden: true
        })
    },

    confirmAuthory(e) { //确认用户是否有授权
        this.setData({ modalHidden: true })
        var that = this
        if (e.detail.userInfo) { //授权成功登录并更新数据
            app.data.userAuthory = true
            app.login(that._refreshInfo)
        }
    },
    navigateTo(e) { //列表项跳转 需要判断是否登录
        wx.navigateTo({
            url: e.currentTarget.dataset.url
        })
    },
    navigateToWithAuthory(e) {
        var that = this
        this._checkAuthoryShowModal(() => {
            that.navigateTo(e)
        })
    },
    _checkAuthoryShowModal(callback = () => { }) {
        if (app.data.logged && app.data.userAuthory) {
            this.setData({ modalHidden: true })
            callback()
        } else if (!app.data.userAuthory) { //未授权登录
            this.setData({ modalHidden: false })
        }
    }
})