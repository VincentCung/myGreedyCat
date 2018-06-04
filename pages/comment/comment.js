// pages/comment/comment.js
const config = require('../../config')
Page({

  /**
   * 页面的初始数据
   */
  data: {
      textareaMaxLen:30,
      textareaLen:0
  
  },
  bindTextAreaChange:function(e){
      var that = this
      var len = parseInt(e.detail.value.length)
      that.setData({ textareaLen: len })
  },
  formSubmit: function (e) {
      let that=this;
      let value = e.detail.value;
      let comment_data={
          content: value.comment,
          is_public: !value.isPublic,
          mapid: that.options.mapid,
          open_id: getApp().data.userInfo.openId
      }
        console.log(comment_data)
      wx.request({
          url: config.service.host + "/user/comment",
          method: "POST",
          data: comment_data,
          success: function (res) {
              console.log(res)
              wx.navigateBack({
                  delta: 1
              })
          }
      })
  },

})