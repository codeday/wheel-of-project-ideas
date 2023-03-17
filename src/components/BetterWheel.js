import Box from '@codeday/topo/Atom/Box';
import { Component, createRef } from 'react';

const PI2 = Math.PI * 2;
const RAD_PER_DEG = Math.PI / 180;

function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}

export default class BetterWheel extends Component {
  constructor(props) {
    super(props);
    const { minDegPerSec, maxDegPerSec, times, size, onClick } = props;

    const minRadPerMs = (minDegPerSec / 1000) * RAD_PER_DEG;
    const maxRadPerMs = (maxDegPerSec / 1000) * RAD_PER_DEG;

    this.drawSize = (size/2) - 5;
    this.centerX = this.drawSize + 5;
    this.centerY = this.drawSize + 5;

    this.angleCurrent = Math.random() * PI2;
    this.isSpinning = false;

    this.canvas = createRef();
    this.spin = this.spin.bind(this);
    this.frame = this.frame.bind(this);
    this.draw = this.draw.bind(this);
    this.drawNeedle = this.drawNeedle.bind(this);
    this.drawSegment = this.drawSegment.bind(this);
    this.drawWheel = this.drawWheel.bind(this);
    this.clear = this.clear.bind(this);

    let elapsed = 0;
    this.tweenTimes = [
      { time: 0, radPerMs: 0 },
      ...times.slice(0, times.length - 1).map((time, i) => ({
        time: (elapsed = elapsed + time),
        radPerMs: [maxRadPerMs, maxRadPerMs, minRadPerMs, minRadPerMs][(i + 1) % 4],
      })),
      { time: elapsed + times[times.length - 1], radPerMs: 0 },
    ];
  }

  render() {
    const { size, ...rest } = this.props;

    return (
      <Box
        as="canvas"
        ref={this.canvas}
        width={size}
        height={size}
        d="inline-block"
        onClick={this.spin}
        {...rest}
      />
    )
  }

  componentDidMount() {
    const { size } = this.props;

    if (this.canvas?.current) {
      this.ctx = this.canvas.current.getContext('2d');
      this.canvas.current.setAttribute('width', size)
      this.canvas.current.setAttribute('height', size)
      this.frame(false);
      if (typeof window !== 'undefined') this.inactiveDrawInterval = setInterval(this.frame, 1000);
    }
  }

  componentWillUnmount() {
    if (this.inactiveDrawInterval) clearInterval(this.inactiveDrawInterval);
  }

  spin() {
    this.spinStartTime = new Date().getTime();
    this.lastFrameTime = new Date().getTime();
    this.isSpinning = true;
    this.props.onSpinning && this.props.onSpinning();
    this.frame(true);
  }

  frame(loop) {
    const { onComplete } = this.props;
    if (!this.isSpinning) return this.draw();

    const now = new Date().getTime();
    const elapsedTime = !this.spinStartTime ? 0 : now - this.spinStartTime;
    const frameElapsedTime = !this.lastFrameTime ? 0 : now - this.lastFrameTime;

    // Interpolation to get current speed
    const tweenIndex = Math.max(1, this.tweenTimes.filter((t) => t.time < elapsedTime).length);
    const tweenPrevious = this.tweenTimes[tweenIndex - 1];
    const tweenNext = this.tweenTimes[tweenIndex];

    if (tweenNext) {
      const tweenDiff = tweenNext.radPerMs - tweenPrevious.radPerMs;
      const tweenPercent = (elapsedTime - tweenPrevious.time) / (tweenNext.time - tweenPrevious.time);
      const deltaAngle = ((tweenPercent * tweenDiff) + tweenPrevious.radPerMs) * frameElapsedTime;
      this.angleCurrent = (this.angleCurrent + deltaAngle) % PI2;
    } else {
      this.isSpinning = false;
      onComplete && onComplete();
    }

    this.lastFrameTime = now;
    this.draw();
    if (loop) window?.requestAnimationFrame(this.frame);
  }

  draw() {
    this.clear();
    this.drawWheel();
    this.drawNeedle();
  }

  drawSegment (key, lastAngle, angle) {
    const { ctx, centerX, centerY, drawSize } = this;
    const { segments, colors, contrastColor, fontSize, font } = this.props;
    const value = segments[key];

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, drawSize, lastAngle, angle, false);
    ctx.lineTo(centerX, centerY);
    ctx.closePath();
    ctx.fillStyle = colors[key % colors.length];
    ctx.fill();
    ctx.stroke();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((lastAngle + angle) / 2);
    ctx.fillStyle = contrastColor || 'white';
    ctx.font = `bold ${fontSize} ${font}`;
    const fontHeight = (ctx.measureText('foo').fontBoundingBoxDescent || ctx.measureText('foo').actualBoundingBoxAscent) * 2
    console.log(fontHeight)
    const lines = getLines(ctx, value, drawSize /2 + 20)
    let curHeight = (lines.length * fontHeight) / 4 * -1
    lines.forEach((line, idx) => {
      // console.log(curHeight)
      ctx.fillText(line, drawSize / 2 + 20, curHeight);
      curHeight += fontHeight
    })
    ctx.restore();
  }

  drawWheel() {
    const { ctx, centerX, centerY, drawSize, angleCurrent } = this;
    const { segments, primaryColor, contrastColor, buttonText, font, fontSize } = this.props;

    let lastAngle = angleCurrent;
    const len = segments.length
    ctx.lineWidth = 1;
    ctx.strokeStyle = primaryColor || 'black';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = `${fontSize} ${font}`;

    // Draw segments
    for (let i = 1; i <= len; i++) {
      const angle = PI2 * (i / len) + angleCurrent;
      this.drawSegment(i - 1, lastAngle, angle);
      lastAngle = angle;
    }

    // Draw a center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 50, 0, PI2, false)
    ctx.closePath()
    ctx.fillStyle = primaryColor || 'black'
    ctx.lineWidth = 10
    ctx.strokeStyle = contrastColor || 'white'
    ctx.fill()
    ctx.font = `bold ${fontSize} ${font}`
    ctx.fillStyle = contrastColor || 'white'
    ctx.textAlign = 'center'
    ctx.fillText(buttonText || 'Spin', centerX, centerY + 3)
    ctx.stroke()

    // Draw outer circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, drawSize, 0, PI2, false)
    ctx.closePath()

    ctx.lineWidth = 10
    ctx.strokeStyle = primaryColor || 'black'
    ctx.stroke()
  }

  drawNeedle() {
    const { ctx, centerX, centerY, angleCurrent } = this;
    const { font, primaryColor, contrastColor, segments, onUpdate } = this.props;

    ctx.lineWidth = 1
    ctx.strokeStyle = contrastColor || 'white'
    ctx.fileStyle = contrastColor || 'white'
    ctx.beginPath()
    ctx.moveTo(centerX + 20, centerY - 50)
    ctx.lineTo(centerX - 20, centerY - 50)
    ctx.lineTo(centerX, centerY - 70)
    ctx.closePath()
    ctx.fill()
    const change = angleCurrent + Math.PI / 2
    let i =
      segments.length -
      Math.floor((change / (Math.PI * 2)) * segments.length) -
      1
    if (i < 0) i = i + segments.length
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = primaryColor || 'black'
    ctx.font = `bold 1.5em ${font}`

    if (segments[i] !== this.previousSegment) {
      this.previousSegment = segments[i];
      onUpdate && onUpdate(segments[i]);
    }
  }

  clear() {
    const { size } = this.props;

    this.ctx.clearRect(0, 0, size, size)
  }
}
