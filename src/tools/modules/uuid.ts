function getRandomValues(count: number): Uint8Array {
  const array = new Uint8Array(count)
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < count; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return array
}

export function generateUUIDv4(): string {
  const bytes = getRandomValues(16)
  
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80

  const hex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

export function generateUUIDs(count: number, uppercase: boolean = false): string[] {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    let uuid = generateUUIDv4()
    if (uppercase) {
      uuid = uuid.toUpperCase()
    }
    result.push(uuid)
  }
  return result
}

export interface ULIDInfo {
  ulid: string
  timestamp: number
  randomPart: string
  date: string
}

const ULID_ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

function encodeULIDTime(timestamp: number): string {
  let time = timestamp
  let result = ''
  for (let i = 0; i < 10; i++) {
    result = ULID_ENCODING[time & 31] + result
    time = Math.floor(time / 32)
  }
  return result
}

function encodeULIDRandom(): string {
  const bytes = getRandomValues(16)
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += ULID_ENCODING[bytes[i] & 31]
  }
  return result
}

export function generateULID(): string {
  const timestamp = Date.now()
  return encodeULIDTime(timestamp) + encodeULIDRandom()
}

export function parseULID(ulid: string): ULIDInfo {
  const cleanUlid = ulid.toUpperCase().trim()
  
  if (cleanUlid.length !== 26) {
    throw new Error('ULID 长度必须为 26 个字符')
  }

  for (let i = 0; i < cleanUlid.length; i++) {
    if (!ULID_ENCODING.includes(cleanUlid[i])) {
      throw new Error(`ULID 包含非法字符: ${cleanUlid[i]}`)
    }
  }

  const timePart = cleanUlid.slice(0, 10)
  const randomPart = cleanUlid.slice(10)

  let timestamp = 0
  for (let i = 0; i < timePart.length; i++) {
    timestamp = timestamp * 32 + ULID_ENCODING.indexOf(timePart[i])
  }

  const date = new Date(timestamp).toLocaleString('zh-CN')

  return {
    ulid: cleanUlid,
    timestamp,
    randomPart,
    date
  }
}

export function generateULIDs(count: number): string[] {
  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(generateULID())
  }
  return result
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid.trim())
}

export function validateULID(ulid: string): boolean {
  try {
    parseULID(ulid)
    return true
  } catch {
    return false
  }
}
