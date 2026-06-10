import yaml from 'js-yaml'

export interface JsonOptions {
  indent?: number
  sortKeys?: boolean
  escapeUnicode?: boolean
}

export interface JsonError {
  message: string
  line?: number
  column?: number
}

export function formatJson(json: string, options: JsonOptions = {}): string {
  const indent = options.indent ?? 2
  let obj = parseJson(json)

  if (options.sortKeys) {
    obj = sortObjectKeys(obj)
  }

  let result = JSON.stringify(obj, null, indent)

  if (options.escapeUnicode) {
    result = result.replace(/[\u007F-\uFFFF]/g, chr => {
      return '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4)
    })
  }

  return result
}

export function compressJson(json: string): string {
  const obj = parseJson(json)
  return JSON.stringify(obj)
}

export function validateJson(json: string): { valid: boolean; error?: JsonError } {
  try {
    JSON.parse(json)
    return { valid: true }
  } catch (e: any) {
    const error: JsonError = { message: e.message }

    const match = e.message.match(/line (\d+) column (\d+)/)
    if (match) {
      error.line = parseInt(match[1], 10)
      error.column = parseInt(match[2], 10)
    }

    return { valid: false, error }
  }
}

export function parseJson<T = any>(json: string): T {
  return JSON.parse(json)
}

export function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  }
  if (obj && typeof obj === 'object') {
    const sorted: any = {}
    const keys = Object.keys(obj).sort()
    for (const key of keys) {
      sorted[key] = sortObjectKeys(obj[key])
    }
    return sorted
  }
  return obj
}

export function jsonToYaml(json: string): string {
  const obj = parseJson(json)
  return yaml.dump(obj, { indent: 2 })
}

export function yamlToJson(yamlStr: string): string {
  const obj = yaml.load(yamlStr)
  return JSON.stringify(obj, null, 2)
}
