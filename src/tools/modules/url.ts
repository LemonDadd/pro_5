export interface ParsedUrl {
  protocol: string
  host: string
  hostname: string
  port: string
  pathname: string
  search: string
  hash: string
  origin: string
  searchParams: Record<string, string>
}

export function encodeUrl(text: string): string {
  try {
    return encodeURIComponent(text)
  } catch {
    return text
  }
}

export function decodeUrl(text: string): string {
  try {
    return decodeURIComponent(text)
  } catch {
    throw new Error('无效的 URL 编码字符串')
  }
}

export function batchEncodeUrl(text: string): string {
  const lines = text.split('\n')
  return lines.map(line => {
    if (!line.trim()) return line
    return encodeUrl(line)
  }).join('\n')
}

export function batchDecodeUrl(text: string): string {
  const lines = text.split('\n')
  return lines.map(line => {
    if (!line.trim()) return line
    try {
      return decodeUrl(line)
    } catch {
      return line
    }
  }).join('\n')
}

export function parseUrl(url: string): ParsedUrl {
  try {
    const u = new URL(url)
    const searchParams: Record<string, string> = {}
    u.searchParams.forEach((value, key) => {
      searchParams[key] = value
    })
    return {
      protocol: u.protocol,
      host: u.host,
      hostname: u.hostname,
      port: u.port,
      pathname: u.pathname,
      search: u.search,
      hash: u.hash,
      origin: u.origin,
      searchParams
    }
  } catch {
    throw new Error('无效的 URL')
  }
}
