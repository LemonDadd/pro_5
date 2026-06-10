import cronstrue from 'cronstrue/i18n'

export interface CronInfo {
  expression: string
  description: string
  nextExecutions: Date[]
  isValid: boolean
  error?: string
}

export interface CronTemplate {
  name: string
  expression: string
}

const CRON_TEMPLATES: CronTemplate[] = [
  { name: '每分钟', expression: '* * * * *' },
  { name: '每小时', expression: '0 * * * *' },
  { name: '每天 00:00', expression: '0 0 * * *' },
  { name: '每天 2:00', expression: '0 2 * * *' },
  { name: '每周一 9:00', expression: '0 9 * * 1' },
  { name: '每月 1 日 00:00', expression: '0 0 1 * *' },
  { name: '每周工作日 9:00', expression: '0 9 * * 1-5' },
  { name: '每年 1 月 1 日 00:00', expression: '0 0 1 1 *' }
]

function parseCronField(field: string, min: number, max: number): number[] {
  const values: number[] = []
  
  if (field === '*') {
    for (let i = min; i <= max; i++) values.push(i)
    return values
  }

  const parts = field.split(',')
  for (const part of parts) {
    if (part.includes('/')) {
      const [range, step] = part.split('/')
      const stepNum = parseInt(step, 10)
      let start = min
      let end = max
      
      if (range !== '*') {
        const [s, e] = range.split('-').map(n => parseInt(n, 10))
        start = s
        end = e || s
      }
      
      for (let i = start; i <= end; i += stepNum) {
        values.push(i)
      }
    } else if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n, 10))
      for (let i = start; i <= end; i++) {
        values.push(i)
      }
    } else {
      values.push(parseInt(part, 10))
    }
  }

  return values.filter(v => v >= min && v <= max)
}

function validateCron(expression: string): { valid: boolean; error?: string } {
  const trimmed = expression.trim()
  if (!trimmed) {
    return { valid: false, error: 'Cron 表达式不能为空' }
  }

  const parts = trimmed.split(/\s+/)
  if (parts.length !== 5 && parts.length !== 6) {
    return { valid: false, error: `Cron 表达式需要 5 或 6 个字段，当前有 ${parts.length} 个` }
  }

  const isSixField = parts.length === 6
  let minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string, second: string | undefined
  if (isSixField) {
    [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts
  } else {
    [minute, hour, dayOfMonth, month, dayOfWeek] = parts
    second = undefined
  }

  try {
    const minutes = parseCronField(minute, 0, 59)
    const hours = parseCronField(hour, 0, 23)
    const days = parseCronField(dayOfMonth, 1, 31)
    const months = parseCronField(month, 1, 12)
    const weekdays = parseCronField(dayOfWeek, 0, 7)
    
    if (second !== undefined) {
      parseCronField(second, 0, 59)
    }

    if (minutes.length === 0) return { valid: false, error: '分钟字段无效' }
    if (hours.length === 0) return { valid: false, error: '小时字段无效' }
    if (days.length === 0) return { valid: false, error: '日期字段无效' }
    if (months.length === 0) return { valid: false, error: '月份字段无效' }
    if (weekdays.length === 0) return { valid: false, error: '星期字段无效' }

    return { valid: true }
  } catch (e: any) {
    return { valid: false, error: e.message || 'Cron 表达式格式错误' }
  }
}

function getNextExecutions(expression: string, count: number = 5): Date[] {
  const parts = expression.trim().split(/\s+/)
  const isSixField = parts.length === 6
  
  const executions: Date[] = []
  let now = new Date()
  now.setMilliseconds(0)

  const [minuteField, hourField, dayOfMonthField, monthField, dayOfWeekField] = isSixField 
    ? parts.slice(1) 
    : parts

  const minutes = parseCronField(minuteField, 0, 59)
  const hours = parseCronField(hourField, 0, 23)
  const days = parseCronField(dayOfMonthField, 1, 31)
  const months = parseCronField(monthField, 1, 12)
  const weekdays = parseCronField(dayOfWeekField, 0, 7)

  const weekdaysSet = new Set(weekdays.map(d => d === 7 ? 0 : d))

  function matches(date: Date): boolean {
    return (
      minutes.includes(date.getMinutes()) &&
      hours.includes(date.getHours()) &&
      days.includes(date.getDate()) &&
      months.includes(date.getMonth() + 1) &&
      weekdaysSet.has(date.getDay())
    )
  }

  function nextMinute(date: Date): Date {
    const next = new Date(date)
    next.setSeconds(0, 0)
    next.setMinutes(next.getMinutes() + 1)
    return next
  }

  let current = new Date(now)
  current = nextMinute(current)

  const maxIterations = 525600
  let iterations = 0

  while (executions.length < count && iterations < maxIterations) {
    if (matches(current)) {
      executions.push(new Date(current))
    }
    current = nextMinute(current)
    iterations++
  }

  return executions
}

export function parseCron(expression: string): CronInfo {
  const validation = validateCron(expression)
  if (!validation.valid) {
    return {
      expression,
      description: '',
      nextExecutions: [],
      isValid: false,
      error: validation.error
    }
  }

  try {
    const parts = expression.trim().split(/\s+/)
    const fiveFieldExpr = parts.length === 6 ? parts.slice(1).join(' ') : expression
    
    const description = cronstrue.toString(fiveFieldExpr, {
      locale: 'zh_CN',
      use24HourTimeFormat: true
    })

    const nextExecutions = getNextExecutions(expression, 5)

    return {
      expression,
      description,
      nextExecutions,
      isValid: true
    }
  } catch (e: any) {
    return {
      expression,
      description: '',
      nextExecutions: [],
      isValid: false,
      error: e.message || '无法解析 Cron 表达式'
    }
  }
}

export function getCronTemplates(): CronTemplate[] {
  return CRON_TEMPLATES
}

export function formatDate(date: Date, timeZone?: string): string {
  return date.toLocaleString('zh-CN', {
    timeZone: timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
