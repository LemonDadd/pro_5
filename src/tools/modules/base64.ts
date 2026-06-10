import { Base64 } from 'js-base64'

export interface Base64Options {
  urlSafe?: boolean
  mimeWrap?: boolean
}

export function encodeBase64(text: string, options: Base64Options = {}): string {
  let result = Base64.encode(text)
  if (options.urlSafe) {
    result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  if (options.mimeWrap) {
    result = result.replace(/(.{76})/g, '$1\n')
  }
  return result
}

export function decodeBase64(str: string, options: Base64Options = {}): string {
  let input = str.trim()
  if (options.urlSafe) {
    input = input.replace(/-/g, '+').replace(/_/g, '/')
    const padLen = 4 - (input.length % 4)
    if (padLen !== 4) {
      input += '='.repeat(padLen)
    }
  }
  try {
    return Base64.decode(input)
  } catch {
    throw new Error('无效的 Base64 字符串')
  }
}

export function isValidBase64(str: string): boolean {
  if (!str.trim()) return false
  try {
    Base64.decode(str.trim())
    return true
  } catch {
    return false
  }
}

export function looksLikeBase64(str: string): boolean {
  const trimmed = str.trim()
  if (trimmed.length < 4) return false
  const base64Regex = /^[A-Za-z0-9+/]+={0,2}$/
  const urlSafeRegex = /^[A-Za-z0-9_-]+={0,2}$/
  return base64Regex.test(trimmed) || urlSafeRegex.test(trimmed)
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1] || ''
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function base64ToBlob(base64: string, mimeType = 'application/octet-stream'): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
