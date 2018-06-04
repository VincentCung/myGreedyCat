// Components/delete-list/delete-list.js
Component({
    properties: {
        configList: {
            type: Array,
        },
        bubbleTap: {
            type: Boolean,
            value: false
        }
    },
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },

    data: {
        startX: 0,//滑动开始的x坐标
        buttonWidth: 100,//删除按钮的宽
        activeIndex: null
    },

    methods: {
        ontouchStart(e) {
            console.log('删除左滑')
            if (e.touches.length == 1) {
                let currentIndex = e.currentTarget.dataset.index;
                let { configList, activeIndex } = this.data;
                if (activeIndex != null) {
                    configList[activeIndex].leftDistance = 0;
                }
                this.setData({
                    startX: e.touches[0].clientX
                });
            }

        },


        ontouchEnd(e) {
            if (e.changedTouches.length == 1) {
                let moveX = e.changedTouches[0].clientX;
                let distance = this.data.startX - moveX;
                let index = e.currentTarget.dataset.index;
                let { buttonWidth, configList, activeIndex } = this.data
                let that = this
                if (distance > buttonWidth / 3) {
                    configList[index].leftDistance = -buttonWidth;
                    activeIndex = index;
                    setTimeout(() => {
                        if (configList[activeIndex]){
                            configList[activeIndex].leftDistance = 0;
                            activeIndex = null;
                            that.setData({
                                configList,
                                activeIndex
                            })
                        }
                    }, 1000 * 6)
                } else {
                    configList[index].leftDistance = 0
                    activeIndex = null;
                }
                this.setData({
                    configList,
                    activeIndex
                })
            }
        },

        onDelete(e) {
            let configList = this.data.configList;
            let index = e.currentTarget.dataset.index;
            let { itemId } = configList[index]
            let that = this
            let eventOption = {
                composed: true,
                bubbles: true
            }
            wx.showModal({
                title: '提示',
                content: '确定删除吗？',
                confirmColor: '#EB6159',
                success(res) {
                    if (res.confirm) {
                        that.triggerEvent('deleteItem', { itemId }, eventOption)
                        configList.splice(index, 1);

                        that.setData({
                            configList
                        });
                    }

                }
            })
        },

    }
})
