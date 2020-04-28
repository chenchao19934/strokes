/**
 * canvas 手写毛笔字效果
 * @params { object } pageContext
 * @params { object } canvas 实例
 * @params { object } viewBox 视图滚动数据
 * @params { number } lineMax 每个点最大半径
 * @params { number } lineMin 每个点最小半径
 * @params { number } linePressure 压力力度，值越大，初始点半径约接近最大半径
 * @params { number } smoothness 平滑度
 */
export class Strokes {
  constructor(pageContext, canvas, viewBox, lineMax = 30, lineMin = 3, linePressure = 1, smoothness = 80) {
    this.context = pageContext
    this.canvas = canvas
    this.viewBox = viewBox
    this.lineMax = lineMax
    this.lineMin = lineMin
    this.linePressure = linePressure
    this.smoothness = smoothness
    this.factor = wx.getSystemInfoSync().screenWidth / 750

    this.context.touchStart = this.touchStart.bind(this)
    this.context.touchMove = this.touchMove.bind(this)
    this.context.touchEnd = this.touchEnd.bind(this)

  }

  static getInstance(pageContext, canvas, viewBox, lineMax = 30, lineMin = 3, linePressure = 1, smoothness = 80) {
    if (!this.instance) {
      this.instance = new Strokes(pageContext, canvas, viewBox, lineMax, lineMin, linePressure, smoothness);
    } else {
      this.instance.context = pageContext
      this.instance.canvas = canvas
      this.instance.viewBox = viewBox
      this.instance.lineMax = lineMax
      this.instance.lineMin = lineMin
      this.instance.linePressure = linePressure
      this.instance.smoothness = smoothness
    }
    return this.instance;
  }

  init() {
    this.ctx = this.canvas.getContext('2d')
    this.moveFlag = false
    this.upof = {}
    this.radius = 0
    this.has = []
  }

  touchStart(e) {
    this.moveFlag = true;
    this.has = [];
    this.upof = this.getXY(e);
  }

  touchMove(e) {
    if (!this.moveFlag) return;
    let off = this.getXY(e);
    let up = this.upof;

    let ur = this.radius;
    this.has.unshift({
      time: new Date().getTime(),
      dis: this.distance(up, off)
    });
    let dis = 0;
    let time = 0;
    for (let n = 0; n < this.has.length - 1; n++) {
      dis += this.has[n].dis;
      time += this.has[n].time - this.has[n + 1].time;
      if (dis > this.smoothness)
        break;
    }
    // 按压时间越长笔锋越粗
    let or = Math.min(time / dis * this.linePressure + this.lineMin, this.lineMax) / 2;
    this.radius = or;
    this.upof = off;
    if (this.has.length <= 4) return;
    let len = Math.round(this.has[0].dis / 2) + 1;

    for (let i = 0; i < len; i++) {
      let x = up.x + (off.x - up.x) / len * i;
      let y = up.y + (off.y - up.y) / len * i;
      let r = ur + (or - ur) / len * i;
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      this.ctx.arc(x, y, r, 0, 2 * Math.PI, true);
      this.ctx.fill();
    }
  }

  touchEnd(e) {
    this.moveFlag = false
  }

  getXY(e) {
    return {
      x: e.touches[0].x - (this.canvas.offsetLeft || 0) + (this.viewBox.scrollLeft || 0),
      y: e.touches[0].y - (this.canvas.offsetTop || 0) + (this.viewBox.scrollTop || 0)
    }
  }

  distance(a, b) {
    let [x, y] = [b.x - a.x, b.y - a.y];
    return Math.sqrt(x * x + y * y);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  toPx(rpx) {
    return rpx * this.factor;
  }

  toRpx(px) {
    return px / this.factor;
  }
}