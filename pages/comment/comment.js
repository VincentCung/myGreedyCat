// pages/comment/comment.js
const config = require('../../config')
const util = require('../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
      textareaMaxLen:50,
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
      if(value.content) {
          let comment_data = {
              content: value.content,
              is_public: !value.isPublic,
              mapid: that.options.mapid,
              open_id: getApp().data.userInfo.openId
          }
          console.log(comment_data)
          wx.showLoading({
              title: '发送中',
              mask:true
          })
          wx.request({
              url: config.service.host + "/user/comment",
              method: "POST",
              data: comment_data,
              success: function (res) {
                  console.log(res)
                  wx.navigateBack({
                      delta: 1
                  })
              }, fail(error) {
                  util.showModel('网络错误', '请检查好网络后重试')
                  console.log(error)
                  wx.hideLoading()
              }
          })
      } else {
          util.showModel('提示','评论不能为空')
      }
  },

})