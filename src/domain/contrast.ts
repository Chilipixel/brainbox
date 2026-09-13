function channel(value: number) {
  const normalized = value / 255
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
}

export function contrastRatio(foreground: string, background: string) {
  const luminance = (color: string) => {
    const hex = color.replace('#', '')
    const values = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16))
    return 0.2126 * channel(values[0]) + 0.7152 * channel(values[1]) + 0.0722 * channel(values[2])
  }
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}
