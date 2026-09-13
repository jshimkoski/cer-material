/** Pre-generated Material theme families shipped as static CSS. */
export const materialThemeFamilies = [
  'mauve',
  'olive',
  'mist',
  'taupe',
  'slate',
  'gray',
  'zinc',
  'stone',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const

export type MaterialThemeFamily = (typeof materialThemeFamilies)[number]

const materialThemeFamilySet: ReadonlySet<string> = new Set(materialThemeFamilies)

export function isMaterialThemeFamily(value: string): value is MaterialThemeFamily {
  return materialThemeFamilySet.has(value)
}
