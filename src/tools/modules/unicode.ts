export interface CodePoint {
  char: string
  codePoint: number
  hex: string
  unicodeEscape: string
}

export type UnicodeFormat = 'uXXXX' | 'uXXXXXX'

export function textToUnicode(text: string, format: UnicodeFormat = 'uXXXX'): string {
  let result = ''
  for (const char of text) {
    const codePoint = char.codePointAt(0)!
    if (format === 'uXXXX' && codePoint <= 0xFFFF) {
      result += `\\u${codePoint.toString(16).padStart(4, '0').toUpperCase()}`
    } else {
      result += `\\u{${codePoint.toString(16).toUpperCase()}}`
    }
  }
  return result
}

export function unicodeToText(str: string): string {
  let result = str
  result = result.replace(/\\u\{([0-9a-fA-F]+)\}/g, (_, hex) => {
    const codePoint = parseInt(hex, 16)
    return String.fromCodePoint(codePoint)
  })
  result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  return result
}

export function getCodePoints(text: string): CodePoint[] {
  const result: CodePoint[] = []
  for (const char of text) {
    const codePoint = char.codePointAt(0)!
    result.push({
      char,
      codePoint,
      hex: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0'),
      unicodeEscape: codePoint <= 0xFFFF
        ? `\\u${codePoint.toString(16).padStart(4, '0').toUpperCase()}`
        : `\\u{${codePoint.toString(16).toUpperCase()}}`
    })
  }
  return result
}

export function splitEmoji(text: string): string[] {
  const result: string[] = []
  let i = 0
  while (i < text.length) {
    const codePoint = text.codePointAt(i)!
    result.push(String.fromCodePoint(codePoint))
    i += codePoint > 0xFFFF ? 2 : 1
  }
  return result
}
