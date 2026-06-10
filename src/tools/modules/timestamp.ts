export interface TimestampInfo {
  unixSec: number
  unixMs: number
  iso8601: string
  localString: string
  utcString: string
  relativeTime: string
}

export interface BatchResult {
  input: string
  result: TimestampInfo | null
  error?: string
}

function detectTimestampType(input: string): { type: 'sec' | 'ms' | 'iso' | 'local' | null; value: number | string | null } {
  const trimmed = input.trim()
  if (!trimmed) return { type: null, value: null }

  if (/^\d{10}$/.test(trimmed)) {
    return { type: 'sec', value: parseInt(trimmed, 10) }
  }

  if (/^\d{13}$/.test(trimmed)) {
    return { type: 'ms', value: parseInt(trimmed, 10) }
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed) || /^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return { type: 'iso', value: trimmed }
  }

  const parsed = Date.parse(trimmed)
  if (!isNaN(parsed)) {
    return { type: 'local', value: trimmed }
  }

  return { type: null, value: null }
}

function getRelativeTime(timestampMs: number): string {
  const now = Date.now()
  const diffMs = timestampMs - now
  const diffSec = Math.round(Math.abs(diffMs) / 1000)

  if (diffSec < 60) {
    return diffMs >= 0 ? `${diffSec} 秒后` : `${diffSec} 秒前`
  }
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60)
    return diffMs >= 0 ? `${mins} 分钟后` : `${mins} 分钟前`
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600)
    return diffMs >= 0 ? `${hours} 小时后` : `${hours} 小时前`
  }
  if (diffSec < 2592000) {
    const days = Math.floor(diffSec / 86400)
    return diffMs >= 0 ? `${days} 天后` : `${days} 天前`
  }
  if (diffSec < 31536000) {
    const months = Math.floor(diffSec / 2592000)
    return diffMs >= 0 ? `${months} 个月后` : `${months} 个月前`
  }
  const years = Math.floor(diffSec / 31536000)
  return diffMs >= 0 ? `${years} 年后` : `${years} 年前`
}

export function convertTimestamp(input: string, timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone): TimestampInfo {
  const detected = detectTimestampType(input)
  if (!detected.type || detected.value === null) {
    throw new Error('无法识别的时间格式')
  }

  let timestampMs: number
  try {
    switch (detected.type) {
      case 'sec':
        timestampMs = (detected.value as number) * 1000
        break
      case 'ms':
        timestampMs = detected.value as number
        break
      case 'iso':
      case 'local':
        timestampMs = new Date(detected.value as string).getTime()
        if (isNaN(timestampMs)) {
          throw new Error('无法解析的时间字符串')
        }
        break
      default:
        throw new Error('无法识别的时间格式')
    }
  } catch (e: any) {
    throw new Error(e.message || '时间转换失败')
  }

  const date = new Date(timestampMs)

  return {
    unixSec: Math.floor(timestampMs / 1000),
    unixMs: timestampMs,
    iso8601: date.toISOString(),
    localString: date.toLocaleString('zh-CN', { timeZone }),
    utcString: date.toUTCString(),
    relativeTime: getRelativeTime(timestampMs)
  }
}

export function getCurrentTimestamp(timeZone?: string): TimestampInfo {
  return convertTimestamp(Date.now().toString(), timeZone)
}

export function batchConvertTimestamps(input: string, timeZone?: string): BatchResult[] {
  const lines = input.trim().split('\n').filter(l => l.trim())
  return lines.map(line => {
    try {
      return {
        input: line.trim(),
        result: convertTimestamp(line.trim(), timeZone)
      }
    } catch (e: any) {
      return {
        input: line.trim(),
        result: null,
        error: e.message
      }
    }
  })
}

export function getTimeZones(): string[] {
  const commonTimeZones = [
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Singapore',
    'Asia/Hong_Kong',
    'Asia/Seoul',
    'Asia/Dubai',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Australia/Sydney',
    'Pacific/Auckland'
  ]
  return [...new Set(commonTimeZones)]
}
