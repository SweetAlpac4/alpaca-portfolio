const WIDTHS: Record<string, number[]> = {
  overworld: [1280, 1920, 2560],
  cave: [1280, 1920, 2560],
  'deep-dark': [1280, 1920],
  nether: [1280, 1920],
  'the-end': [1280, 1920],
}

type Props = {
  name: string
  eager?: boolean
}

export function BiomeBackground({ name, eager = false }: Props) {
  const widths = WIDTHS[name] ?? [1280]
  const avif = widths.map((w) => `/img/biomes/${name}-${w}.avif ${w}w`).join(', ')
  const webp = widths.map((w) => `/img/biomes/${name}-${w}.webp ${w}w`).join(', ')
  const fallback = widths[widths.length - 1]

  return (
    <picture className="biome__bg" aria-hidden="true">
      <source type="image/avif" srcSet={avif} sizes="100vw" />
      <source type="image/webp" srcSet={webp} sizes="100vw" />
      <img
        src={`/img/biomes/${name}-${fallback}.webp`}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  )
}
