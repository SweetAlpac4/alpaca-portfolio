import { memo, useEffect, useRef } from 'react'

type Props = { heat: number; brewing: boolean; soul: boolean; successful: boolean }

// Native pixel art, matching FishingScene without a new renderer or image dependency.
export const NetherScene = memo(function NetherScene(props: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const latest = useRef(props)
  useEffect(() => { latest.current = props }, [props])
  useEffect(() => {
    const context = canvas.current?.getContext('2d')
    if (!context) return
    const ctx = context
    const bg = document.createElement('canvas')
    bg.width = 480; bg.height = 260
    const base = bg.getContext('2d')
    if (!base) return
    const pixel = (c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => {
      c.fillStyle = color
      c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
    }
    const noise = (n: number) => { const value = Math.sin(n * 53.3) * 9417; return value - Math.floor(value) }
    pixel(base, '#261a25', 0, 0, 480, 260)
    pixel(base, '#55282b', 18, 22, 444, 165)
    pixel(base, '#77332d', 18, 95, 444, 94)
    // Distant basalt pillars, a fortress bridge, and two falls of lava.
    for (let i = 0; i < 18; i++) {
      const x = i * 29
      const height = 30 + noise(i + 1) * 65
      pixel(base, '#41242b', x, 150 - height, 18, height)
      pixel(base, '#633238', x + 2, 150 - height, 4, height)
      pixel(base, '#8a4334', x - 3, 150 - height - 4, 23, 4)
    }
    for (const x of [75, 378]) {
      pixel(base, '#dc6438', x, 25, 10, 150)
      pixel(base, '#f4a04b', x + 2, 25, 4, 150)
    }
    pixel(base, '#33212b', 0, 126, 480, 12)
    for (let x = 12; x < 480; x += 30) {
      pixel(base, '#33212b', x, 118, 12, 10)
      pixel(base, '#33212b', x + 4, 138, 10, 32)
    }
    pixel(base, '#b84e31', 0, 170, 480, 35)
    pixel(base, '#ec813e', 0, 184, 480, 8)
    // Stone arch frames the workshop window.
    for (let y = 0; y < 208; y += 16) {
      for (const x of [0, 16, 448, 464]) {
        pixel(base, (y / 16 + x / 16) % 2 ? '#3b2932' : '#483039', x, y, 15, 15)
        pixel(base, '#62404a', x, y, 15, 2)
      }
    }
    for (let x = 32; x < 448; x += 24) {
      pixel(base, '#49303a', x, 0, 23, 18)
      pixel(base, '#674149', x, 0, 23, 2)
    }
    pixel(base, '#30232e', 32, 18, 20, 20)
    pixel(base, '#30232e', 428, 18, 20, 20)
    pixel(base, '#65423c', 0, 202, 480, 5)
    pixel(base, '#39272f', 0, 207, 480, 53)
    for (let y = 211; y < 260; y += 16) {
      for (let x = (y % 3) * 8 - 24; x < 480; x += 40) {
        pixel(base, '#51353a', x, y, 38, 14)
        pixel(base, '#69433e', x, y, 38, 2)
      }
    }
    // Shelves with ingredient jars, a hanging chain, and a brewing stand.
    for (const y of [77, 129]) {
      pixel(base, '#291e26', 32, y, 79, 8)
      pixel(base, '#855741', 32, y, 79, 3)
      for (let i = 0; i < 3; i++) {
        const x = 40 + i * 23
        pixel(base, '#ad9d83', x + 4, y - 24, 6, 5)
        pixel(base, '#736954', x + 2, y - 19, 10, 17)
        pixel(base, ['#ba5662', '#e5bb60', '#b7cece'][i], x + 3, y - 13, 8, 9)
        pixel(base, '#dac6ab', x + 3, y - 18, 2, 6)
      }
    }
    for (let y = 20; y < 104; y += 7) pixel(base, '#807065', 240, y, 2, 4)
    pixel(base, '#a77c51', 338, 178, 72, 5)
    pixel(base, '#51413d', 342, 183, 6, 22)
    pixel(base, '#51413d', 398, 183, 6, 22)
    pixel(base, '#b39862', 373, 118, 4, 58)
    pixel(base, '#be9959', 354, 147, 39, 3)
    for (const [x, color] of [[350, '#bf6e74'], [375, '#87bda3'], [392, '#d5a659']] as const) {
      pixel(base, '#dfd2b3', x, 152, 4, 8)
      pixel(base, color, x - 3, 160, 10, 12)
      pixel(base, '#d3d8bb', x - 2, 160, 2, 8)
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let last = -Infinity
    const render = (now: number) => {
      frame = requestAnimationFrame(render)
      if (document.hidden || now - last < 50) return
      last = now
      const { heat, brewing, soul, successful } = latest.current
      const time = motion.matches ? 0 : now / 1000
      ctx.clearRect(0, 0, 480, 260)
      ctx.drawImage(bg, 0, 0)
      for (let i = 0; i < 32; i++) {
        const x = noise(i + 50) * 410 + 35
        const y = 173 + noise(i + 85) * 28
        pixel(ctx, i % 2 ? '#ffc267' : '#f39a4f', x + Math.sin(time + i) * 3, y, 3 + noise(i + 100) * 17, 1)
      }
      const flame = soul ? ['#4fb7b6', '#a7efdc', '#e5fae7'] : ['#dc633b', '#f7ac4e', '#ffe1a1']
      pixel(ctx, '#211e26', 176, 229, 117, 9)
      for (let i = 0; i < 9; i++) {
        const x = 190 + i * 11
        const height = 9 + (Math.sin(time * 8 + i * 4) + 1) * (brewing ? 8 + heat / 12 : 5)
        pixel(ctx, flame[0], x, 233 - height, 8, height)
        pixel(ctx, flame[1], x + 2, 238 - height, 4, height - 5)
        pixel(ctx, flame[2], x + 3, 233, 2, 3)
      }
      // Cauldron body with stepped edges, metal highlights, feet and handles.
      pixel(ctx, '#1c2129', 170, 148, 140, 13)
      pixel(ctx, '#1c2129', 180, 156, 120, 49)
      pixel(ctx, '#1c2129', 190, 204, 100, 13)
      pixel(ctx, '#55616a', 183, 161, 114, 40)
      pixel(ctx, '#3b4551', 193, 199, 94, 14)
      pixel(ctx, '#343a48', 262, 161, 35, 40)
      pixel(ctx, '#7c8987', 185, 163, 7, 29)
      pixel(ctx, '#636f73', 196, 200, 43, 3)
      pixel(ctx, '#181e26', 188, 213, 11, 13)
      pixel(ctx, '#181e26', 279, 213, 11, 13)
      pixel(ctx, '#91998b', 168, 150, 145, 4)
      pixel(ctx, '#414d54', 170, 154, 140, 6)
      const liquid = successful ? '#b0db8c' : soul ? '#66c9b6' : heat > 80 ? '#ed8b51' : '#b7729d'
      pixel(ctx, '#392b42', 180, 142, 120, 10)
      pixel(ctx, liquid, 185, 143, 110, 6)
      pixel(ctx, '#e7bea7', 191, 143, 52, 1)
      for (let i = 0; i < 7; i++) {
        const cycle = (time * (brewing ? 0.9 : 0.3) + i * 0.17) % 1
        const x = 195 + noise(i + 11) * 90
        const y = 144 - cycle * (brewing ? 30 : 10)
        ctx.globalAlpha = 1 - cycle
        pixel(ctx, liquid, x, y, 3 + i % 2, 3 + i % 2)
      }
      ctx.globalAlpha = 1
      for (let i = 0; i < 16; i++) {
        const cycle = (time * 0.12 + noise(i + 140)) % 1
        ctx.globalAlpha = Math.sin(cycle * Math.PI) * 0.7
        pixel(ctx, flame[i % 3], 40 + noise(i + 180) * 400, 205 - cycle * 170, 1, 2)
      }
      ctx.globalAlpha = 1
      if (heat > 85 && brewing) {
        ctx.globalAlpha = 0.35
        for (let i = 0; i < 4; i++) pixel(ctx, '#b5a7a5', 214 + Math.sin(time + i) * 16, 123 - i * 12, 22 - i * 3, 7)
        ctx.globalAlpha = 1
      }
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={canvas} width={480} height={260} className="nether-scene" aria-hidden="true" />
})
