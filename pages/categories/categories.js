// pages/categories/categories.js

let iconPath = "../../icons/category/"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    categories: [
      { name: "日韩料理", imageSrc: iconPath+"Japanese.png" },
      { name: "西式简餐", imageSrc: iconPath +"western.png" },
      { name: "川湘菜", imageSrc: iconPath +"ChuanXiang.png" },
      { name: "东南亚风情", imageSrc: iconPath +"Southeast_Asia.png" },
      { name: "下午茶甜点", imageSrc: iconPath +"dessert.png" },
      { name: "特色私房", imageSrc: iconPath +"Cantonese.png" },
      { name: "养生早点", imageSrc: iconPath +"breakfast.png" },
      { name: "简约小食", imageSrc: iconPath +"bbq.png" },
      { name: "其他", imageSrc: iconPath +"else.png" },
    ],
  },

    onLoad() {
        this.setData({
            city:getApp().data.city
        })
    }
})