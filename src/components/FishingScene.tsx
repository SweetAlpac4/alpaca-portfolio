import { memo, useEffect, useRef } from 'react'

type SceneProps = {
  phase: 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'result'
  timePhase: 'night' | 'dawn' | 'day' | 'dusk'
  progress: number
  holding: boolean
  rodColor: string
  rift?: boolean
}

type Palette = {
  sky: string[]
  mountain: string[]
  trees: string[]
  water: string[]
  grass: string[]
  light: string
}

const PALETTES: Record<SceneProps['timePhase'], Palette> = {
  day: {
    sky: ['#6cacc0', '#8dc3cf', '#b3d8d5', '#d4e6ce'],
    mountain: ['#95b8b5', '#699b9b', '#4a8082'],
    trees: ['#2c6060', '#254e43', '#386748', '#548454'],
    water: ['#548e93', '#3d7b86', '#306775', '#255563'],
    grass: ['#254a3b', '#3c6241', '#6e9252'], light: '#f9e9b2',
  },
  dawn: {
    sky: ['#666c92', '#9890aa', '#d0a5a6', '#ecc3a1'],
    mountain: ['#a49da9', '#7d8f9a', '#5f7a82'],
    trees: ['#395c64', '#2d4f4a', '#42634f', '#6a7c58'],
    water: ['#a89b9c', '#707f91', '#4b687c', '#344f63'],
    grass: ['#2a4440', '#405c47', '#73815a'], light: '#ffe1ad',
  },
  dusk: {
    sky: ['#4b5678', '#82718c', '#bd8a93', '#edb19a'],
    mountain: ['#9f8998', '#78758c', '#555e78'],
    trees: ['#39485f', '#2e414a', '#405455', '#68715f'],
    water: ['#a18b98', '#756f88', '#515b77', '#394760'],
    grass: ['#293b3e', '#41504b', '#76715c'], light: '#ffd5a5',
  },
  night: {
    sky: ['#14253e', '#1b304a', '#263f57', '#3a5265'],
    mountain: ['#354e65', '#2a435a', '#233b4e'],
    trees: ['#1b3341', '#152e32', '#234039', '#345449'],
    water: ['#355d70', '#2a4e64', '#234357', '#1b3548'],
    grass: ['#122e2d', '#244239', '#3d5d46'], light: '#d8e6ce',
  },
}

// A fixed, low-resolution world keeps the art crisp and the animation inexpensive.
const W = 480
const H = 240
const HORIZON = 108
const noise = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

function rect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

function polygon(ctx: CanvasRenderingContext2D, color: string, points: number[][]) {
  ctx.fillStyle = color
  ctx.beginPath()
  points.forEach(([x, y], i) => i ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y)))
  ctx.closePath()
  ctx.fill()
}

function pine(ctx: CanvasRenderingContext2D, x: number, ground: number, height: number, colors: string[]) {
  rect(ctx, colors[0], x - 1, ground - height, 3, height)
  for (let tier = 0; tier < 5; tier++) {
    const y = ground - height + tier * height * 0.14
    const half = (tier + 1) * height * 0.065
    polygon(ctx, colors[1], [[x, y], [x + half, y + height * 0.3], [x - half, y + height * 0.3]])
    polygon(ctx, colors[2], [[x, y + 2], [x - half, y + height * 0.3], [x, y + height * 0.25]])
    rect(ctx, colors[3], x - half + 1, y + height * 0.28, half * 0.55, 1)
  }
}

function drawLandscape(ctx: CanvasRenderingContext2D, time: SceneProps['timePhase']) {
  const p = PALETTES[time]
  ctx.imageSmoothingEnabled = false
  p.sky.forEach((color, i) => rect(ctx, color, 0, i * 28, W, 28))

  if (time !== 'day') {
    ctx.globalAlpha = time === 'night' ? 0.8 : 0.3
    for (let i = 0; i < 42; i++) rect(ctx, p.light, noise(i) * W, noise(i + 80) * 72, i % 9 === 0 ? 2 : 1, 1)
    ctx.globalAlpha = 1
  }

  const sunX = time === 'dusk' ? 340 : 154
  const sunY = time === 'day' || time === 'night' ? 33 : 65
  rect(ctx, p.light, sunX, sunY, 19, 19)
  if (time === 'night') {
    rect(ctx, '#b0c8be', sunX + 3, sunY + 11, 5, 4)
    rect(ctx, '#becfc4', sunX + 12, sunY + 4, 4, 6)
  }

  // Stepped clouds and three ridgelines give the lake a readable sense of depth.
  ctx.globalAlpha = time === 'night' ? 0.08 : 0.3
  for (const [x, y, width] of [[33, 30, 65], [224, 21, 77], [365, 48, 94]]) {
    rect(ctx, p.light, x, y + 4, width, 4)
    rect(ctx, p.light, x + 12, y, width * 0.55, 5)
  }
  ctx.globalAlpha = 1
  polygon(ctx, p.mountain[0], [[0, 92], [35, 70], [55, 78], [98, 39], [139, 77], [175, 64], [215, 98], [278, 61], [308, 78], [352, 45], [395, 81], [440, 62], [480, 83], [480, 119], [0, 119]])
  polygon(ctx, p.sky[2], [[78, 60], [98, 39], [119, 58], [108, 54], [101, 58], [94, 51], [90, 60], [85, 56]])
  polygon(ctx, p.sky[2], [[333, 64], [352, 45], [373, 64], [359, 59], [354, 62], [348, 56], [342, 63]])
  polygon(ctx, p.mountain[1], [[0, 93], [43, 82], [80, 95], [121, 79], [164, 103], [209, 93], [250, 103], [291, 83], [323, 96], [383, 79], [437, 97], [480, 86], [480, 121], [0, 121]])
  for (let i = 0; i < 80; i++) {
    const x = i * 6.2
    const height = 8 + noise(i + 10) * 16
    pine(ctx, x, HORIZON + 4, height, [p.mountain[2], p.mountain[2], p.mountain[2], p.mountain[1]])
  }

  p.water.forEach((color, i) => rect(ctx, color, 0, HORIZON + i * 33, W, 33))
  // Broken reflections, never a solid mirror or uniform horizontal stripes.
  ctx.globalAlpha = 0.16
  for (let i = 0; i < 80; i++) {
    const y = HORIZON + noise(i + 60) * 43
    rect(ctx, p.trees[0], noise(i + 250) * W, y, 3 + noise(i + 9) * 18, 1 + noise(i) * 3)
  }
  ctx.globalAlpha = 1
  polygon(ctx, p.trees[0], [[0, 98], [26, 103], [60, 108], [97, 116], [120, 121], [80, 127], [0, 125]])
  polygon(ctx, p.grass[0], [[0, 106], [38, 112], [70, 122], [52, 129], [0, 138]])
  for (let i = 0; i < 12; i++) {
    const x = i * 7 - 10
    pine(ctx, x, 116 + x * 0.1, 35 + noise(i + 45) * 44, p.trees)
  }
  polygon(ctx, p.grass[0], [[480, 112], [446, 117], [415, 130], [388, 135], [415, 143], [480, 150]])
  for (let i = 0; i < 10; i++) pine(ctx, 426 + i * 7, 132 - i, 26 + noise(i + 31) * 61, p.trees)
  rect(ctx, p.grass[2], 0, 126, 44, 2)
  rect(ctx, p.grass[2], 421, 137, 39, 1)

  // Near-bank rocks, reeds and lily pads frame the open casting area.
  polygon(ctx, p.grass[0], [[0, 197], [19, 190], [37, 199], [63, 205], [89, 225], [111, 240], [0, 240]])
  polygon(ctx, p.grass[1], [[0, 195], [19, 190], [37, 199], [60, 204], [73, 219], [32, 210], [0, 214]])
  for (let i = 0; i < 55; i++) {
    const x = noise(i + 90) * 80
    const y = 207 + x * 0.2 + noise(i + 140) * 24
    rect(ctx, i % 3 ? p.grass[1] : p.grass[2], x, y, 2, -4 - noise(i) * 8)
  }
  polygon(ctx, p.mountain[2], [[18, 202], [23, 195], [34, 195], [43, 203], [40, 209], [18, 209]])
  rect(ctx, p.mountain[1], 24, 196, 9, 3)
  for (const [x, y] of [[88, 175], [104, 180], [365, 154], [387, 159], [121, 204]]) {
    rect(ctx, p.water[3], x - 2, y + 2, 13, 3)
    rect(ctx, p.grass[1], x, y, 10, 3)
    rect(ctx, p.grass[2], x + 2, y, 5, 1)
    rect(ctx, p.water[2], x + 7, y, 3, 1)
  }
  rect(ctx, '#cf9baf', 390, 156, 3, 3)
  rect(ctx, '#f0c5c5', 391, 155, 1, 2)
}

function drawDock(ctx: CanvasRenderingContext2D, time: SceneProps['timePhase']) {
  ctx.save()
  // Perspective boards converge at the lake end of the pier.
  polygon(ctx, '#302f2b', [[318, 204], [394, 204], [456, 240], [292, 240]])
  polygon(ctx, '#654f39', [[317, 197], [391, 197], [446, 240], [288, 240]])
  const widths = [197, 202, 209, 218, 230, 240]
  widths.slice(0, -1).forEach((y, i) => {
    const next = widths[i + 1]
    const left = 317 - (y - 197) * 0.68
    const right = 391 + (y - 197) * 1.28
    polygon(ctx, i % 2 ? '#8c704d' : '#9c7e55', [[left, y], [right, y], [391 + (next - 197) * 1.28, next - 1], [317 - (next - 197) * 0.68, next - 1]])
    rect(ctx, '#bea073', left + 1, y, right - left - 1, 1)
    rect(ctx, '#645039', left + 13, y + 3, 16 + i * 3, 1)
    rect(ctx, '#b08c5b', left + 38, y + 2, 22, 1)
    rect(ctx, '#423e33', left + 5, y + 2, 1, 1)
    rect(ctx, '#423e33', right - 5, y + 2, 1, 1)
  })
  for (const [x, y, h] of [[313, 186, 31], [391, 186, 30], [289, 219, 21], [437, 218, 22]]) {
    rect(ctx, '#584530', x, y, 6, h)
    rect(ctx, '#a18557', x, y, 2, h)
    rect(ctx, '#cfac70', x - 1, y, 8, 3)
  }
  // A small warm lantern anchors the foreground, particularly after sunset.
  rect(ctx, '#313936', 328, 188, 9, 11)
  rect(ctx, '#f4c57a', 330, 190, 5, 6)
  rect(ctx, '#ffe3a0', 331, 190, 2, 5)
  rect(ctx, '#343a35', 330, 185, 5, 3)
  rect(ctx, '#b1a080', 331, 184, 3, 1)
  if (time === 'night') {
    ctx.globalAlpha = 0.12
    rect(ctx, '#f8c57b', 322, 200, 26, 6)
  }
  ctx.restore()
}

function drawActivity(ctx: CanvasRenderingContext2D, props: SceneProps, elapsed: number, phaseAge: number) {
  const { phase, progress, holding, rodColor, timePhase } = props
  const p = PALETTES[timePhase]
  const active = phase === 'casting' || phase === 'waiting' || phase === 'bite' || phase === 'reeling'
  const reeling = phase === 'reeling'
  const bobX = 239 + (reeling ? progress * 0.57 : 0)
  const bobY = 157 + (reeling ? progress * 0.22 : 0)
  const pull = reeling && holding ? Math.sin(elapsed * 15) * 2 - 7 : 0
  const tipX = 311 + pull
  const tipY = 109 + pull

  // Only the water glints move; static landscape is cached on a separate canvas.
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 65; i++) {
    const x = (noise(i + 20) * W + Math.sin(elapsed * 0.4 + i) * 4)
    const y = HORIZON + 7 + noise(i + 170) * 112
    const width = 2 + noise(i + 5) * 12
    rect(ctx, i % 4 === 0 ? p.light : p.water[0], x, y, width, 1)
  }
  const sunX = timePhase === 'dusk' ? 349 : 163
  for (let i = 0; i < 18; i++) {
    const y = HORIZON + 5 + i * 3
    const spread = 4 + i * 1.1
    const x = sunX + Math.sin(elapsed * 0.7 + i * 2) * spread
    rect(ctx, p.light, x - spread / 2, y, spread, 1)
  }
  ctx.globalAlpha = 1
  if (props.rift) {
    ctx.save()
    ctx.strokeStyle = '#ed9a74'
    for (let i = 0; i < 4; i++) {
      const pulse = (elapsed * 0.6 + i / 4) % 1
      ctx.globalAlpha = (1 - pulse) * 0.65
      ctx.beginPath()
      ctx.ellipse(bobX, bobY + 3, 8 + pulse * 32, 3 + pulse * 10, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
    ctx.restore()
  }
  drawDock(ctx, timePhase)

  if (active) {
    const cast = phase === 'casting' ? Math.min(1, phaseAge / 550) : 1
    const x = tipX + (bobX - tipX) * cast
    const y = tipY + (bobY - tipY) * cast - Math.sin(cast * Math.PI) * 38
    const dip = phase === 'bite' ? Math.sin(elapsed * 24) * 2 : Math.sin(elapsed * 3) * 0.8
    const shake = reeling ? Math.sin(elapsed * 23) * 2 : 0
    ctx.strokeStyle = '#e2e5cb'
    ctx.lineWidth = 0.7
    ctx.globalAlpha = 0.8
    ctx.beginPath()
    ctx.moveTo(tipX, tipY)
    ctx.quadraticCurveTo((tipX + x) / 2, holding ? y - 12 : y + 8, x + shake, y + dip)
    ctx.stroke()
    ctx.globalAlpha = 1
    if (phase !== 'casting') {
      if (reeling) {
        const fishX = bobX + 5 + Math.sin(elapsed * 9) * 3
        const fishY = bobY + 11
        ctx.globalAlpha = 0.45
        polygon(ctx, p.water[3], [[fishX - 9, fishY], [fishX - 3, fishY - 3], [fishX + 7, fishY - 2], [fishX + 11, fishY], [fishX + 7, fishY + 3], [fishX - 3, fishY + 2]])
        polygon(ctx, p.water[3], [[fishX - 8, fishY], [fishX - 13, fishY - 4], [fishX - 13, fishY + 4]])
      }
      for (let i = 0; i < 3; i++) {
        const cycle = (elapsed * (reeling ? 1.7 : 0.55) + i / 3) % 1
        ctx.globalAlpha = (1 - cycle) * 0.55
        ctx.strokeStyle = p.light
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(bobX, bobY + 4, 4 + cycle * 17, 1 + cycle * 4, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    rect(ctx, '#17333b', x - 3 + shake, y - 5 + dip, 6, 10)
    rect(ctx, '#f1e7c9', x - 2 + shake, y + dip, 4, 3)
    rect(ctx, '#d65d4a', x - 2 + shake, y - 4 + dip, 4, 4)
    rect(ctx, '#ff9b77', x - 2 + shake, y - 4 + dip, 1, 3)
    rect(ctx, '#efe2c3', x + shake, y - 7 + dip, 1, 3)
    if (phase === 'bite' || reeling) {
      for (let i = 0; i < 5; i++) {
        const cycle = (elapsed * 2 + i * 0.21) % 1
        ctx.globalAlpha = 1 - cycle
        rect(ctx, '#d4eee5', bobX + (i - 2) * cycle * 9, bobY - Math.sin(cycle * Math.PI) * 13, 2, 2)
      }
      ctx.globalAlpha = 1
    }
  }

  // Rod and line share one coordinate system, so the line always meets the tip.
  ctx.lineCap = 'square'
  ctx.strokeStyle = '#273630'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(388, 239)
  ctx.quadraticCurveTo(350, 159, tipX, tipY)
  ctx.stroke()
  ctx.strokeStyle = rodColor
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.strokeStyle = '#d3bc84'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.strokeStyle = '#463b2d'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.moveTo(388, 239)
  ctx.lineTo(375, 212)
  ctx.stroke()
  rect(ctx, '#243c40', 367, 211, 9, 9)
  rect(ctx, '#9cb8ad', 368, 212, 6, 6)
  rect(ctx, '#466363', 370, 214, 3, 3)

  if (timePhase === 'night' || timePhase === 'dusk') {
    for (let i = 0; i < 7; i++) {
      ctx.globalAlpha = 0.3 + (Math.sin(elapsed * 1.5 + i * 4) + 1) * 0.3
      rect(ctx, '#e6dc95', 14 + noise(i + 600) * 94 + Math.sin(elapsed + i) * 3, 164 + noise(i + 700) * 50, 1, 2)
    }
    ctx.globalAlpha = 1
  }
}

export const FishingScene = memo(function FishingScene(props: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const latest = useRef(props)
  useEffect(() => { latest.current = props }, [props])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const landscape = document.createElement('canvas')
    landscape.width = W
    landscape.height = H
    const background = landscape.getContext('2d')
    if (!background) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let lastDraw = -Infinity
    let previousTime: SceneProps['timePhase'] | null = null
    let previousPhase = latest.current.phase
    let phaseStart = performance.now()

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw)
      if (document.hidden || now - lastDraw < (motion.matches ? 100 : 33)) return
      lastDraw = now
      const current = latest.current
      if (previousTime !== current.timePhase) {
        drawLandscape(background, current.timePhase)
        previousTime = current.timePhase
      }
      if (previousPhase !== current.phase) {
        previousPhase = current.phase
        phaseStart = now
      }
      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(landscape, 0, 0)
      drawActivity(ctx, current, motion.matches ? 0 : now / 1000, motion.matches ? 550 : now - phaseStart)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  return <canvas ref={canvasRef} className="fishing-pond__scene" width={W} height={H} aria-hidden="true" />
})
