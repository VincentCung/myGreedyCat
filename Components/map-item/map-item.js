// Components/map-item/map-item.js
Component({
    properties: {
        itemDetail: {
            type: Object
        }
    },

    attached() {
        this.setData({
            counters: [
                { name: "likes", num: this.data.itemDetail.num_liked, imgUrl:'../../icons/like.png' },
                { name: "dislikes", num: this.data.itemDetail.num_disliked, imgUrl:'../../icons/dislike.png' },
                { name: "comments", num: this.data.itemDetail.num_comment, imgUrl:'../../icons/comment.png' },
                { name: "collections", num: this.data.itemDetail.num_collected, imgUrl:'../../icons/collect.png' },
            ]
        })
    }
})
