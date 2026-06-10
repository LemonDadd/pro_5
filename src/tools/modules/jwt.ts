import { Base64 } from 'js-base64'

export interface JwtHeader {
  alg: string
  typ?: string
  kid?: string
  [key: string]: any
}

export interface JwtPayload {
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
  [key: string]: any
}

export interface ParsedJwt {
  header: JwtHeader
  payload: JwtPayload
  signature: string
  headerJson: string
  payloadJson: string
  isExpired: boolean
  isAlgNone: boolean
}

export interface JwtParseError {
  message: string
  position?: number
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padLen = 4 - (base64.length % 4)
  if (padLen !== 4) {
    base64 += '='.repeat(padLen)
  }
  try {
    return Base64.decode(base64)
  } catch {
    throw new Error('无效的 Base64URL 编码')
  }
}

export function parseJwt(token: string): ParsedJwt {
  const trimmed = token.trim()

  if (!trimmed) {
    throw new Error('请输入 JWT 令牌')
  }

  const parts = trimmed.split('.')

  if (parts.length !== 3) {
    throw new Error('无效的 JWT 格式：需要包含 Header、Payload 和 Signature 三部分')
  }

  const [headerB64, payloadB64, signature] = parts

  try {
    const headerJson = base64UrlDecode(headerB64)
    const payloadJson = base64UrlDecode(payloadB64)

    const header = JSON.parse(headerJson) as JwtHeader
    const payload = JSON.parse(payloadJson) as JwtPayload

    const now = Math.floor(Date.now() / 1000)
    const isExpired = payload.exp !== undefined ? payload.exp < now : false
    const isAlgNone = header.alg?.toLowerCase() === 'none'

    return {
      header,
      payload,
      signature,
      headerJson: JSON.stringify(header, null, 2),
      payloadJson: JSON.stringify(payload, null, 2),
      isExpired,
      isAlgNone
    }
  } catch (e: any) {
    if (e instanceof SyntaxError) {
      throw new Error('JWT 解析失败：JSON 格式无效')
    }
    throw e
  }
}

export function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}
