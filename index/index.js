const app = getApp()
import {
  Strokes
} from '../draw.js'
Page({
  data: { },
  onLoad: function() {
    const query = wx.createSelectorQuery()
    query.select('#canvas2d').fields({
      node: true,
      size: true,
      scrollOffset: true
    })
    query.selectViewport().scrollOffset()
    query.exec(this.initCanvas.bind(this))
  },
  initCanvas: function(res) {
    let { width, height, node } = res[0]
    let ctx = node.getContext('2d')
    let dpr = wx.getSystemInfoSync().pixelRatio
    node.width = width * dpr
    node.height = height * dpr
    ctx.scale(dpr, dpr)
    this.setData({
      myWriting: Strokes.getInstance(this, node, res[1])
    })
    this.data.myWriting.init()
  },
  clearCanvas() {
    this.data.myWriting && this.data.myWriting.clear()
  }
})