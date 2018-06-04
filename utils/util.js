const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}



// 显示成功提示
let showSuccess = text => {
    wx.hideLoading();
    wx.showToast({
        title: text,
        icon: 'success'
    })
}

// 显示失败提示
let showModel = (title, content) => {
    wx.hideLoading();

    wx.showModal({
        title,
        content,
        showCancel: false,
        confirmColor: "#EB6159"
    })
}

let checkLocationAuth = (callback) => {
    wx.getSetting({
        success(res) {
            if (!res.authSetting['scope.userLocation']) {
                wx.authorize({
                    scope: 'scope.userLocation',
                    success() { callback(true) },
                    fail() { callback(false) }
                })
            } else {
                callback(true)
            }
        }
    })
}

let showLoding = (title = '加载中') => {
    wx.showLoading({
        title: title,
        mask: true
    })
}


module.exports = { formatTime, showSuccess, showModel, showLoding, checkLocationAuth }

