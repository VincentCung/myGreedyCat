Component({
    properties: {
        modalHidden: {
            type: Boolean,
            value: true,
            observer(newVal, oldVal) {
                if (!newVal && oldVal) {
                    var that = this
                    setTimeout(() => that.setData({ top: 20 }), 100)
                    setTimeout(() => that.setData({ opacity: 0.7 }), 100)
                } else if (newVal && !oldVal && this.data.animation) {
                    this.setData({ top: 0 })
                    this.setData({ opacity: 0 })
                }
            }
        },
        width: { type: Number, value: 600 },
        modalContent: { type: String, value: ' ', },
        modalTitle: { type: String, value: ' ', },
        costume: { type: Boolean, value: false },
        lockMask: { type: Boolean, value: false },
        animation: { type: Boolean, value: false }
    },
    attached() {
        this.setData({
            top: this.data.animation ? 0 : 20,
            opacity: this.data.animation ? 0 : 0.7
        })
    },
    methods: {
        modalClickHidden() {
            this.setData({ modalHidden: true, })
        },
        confirm() {
            this.setData({ modalHidden: true, })
            this.triggerEvent('confirm', {}, { bubbles: true, capturePhase: true })
        },
        cancel() {
            this.setData({ modalHidden: true })
            this.triggerEvent('cancel', {}, { bubbles: true, capturePhase: true })
        },
        preventTouch() { }
    }
})  
