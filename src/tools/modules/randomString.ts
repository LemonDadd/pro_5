export interface CharSetOptions {
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
  entropy: number
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const AMBIGUOUS = '0OIl1'

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

function getCharSet(options: CharSetOptions): string {
  let chars = ''
  
  if (options.lowercase) {
    chars += options.excludeAmbiguous 
      ? LOWERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
      : LOWERCASE
  }
  if (options.uppercase) {
    chars += options.excludeAmbiguous
      ? UPPERCASE.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
      : UPPERCASE
  }
  if (options.numbers) {
    chars += options.excludeAmbiguous
      ? NUMBERS.split('').filter(c => !AMBIGUOUS.includes(c)).join('')
      : NUMBERS
  }
  if (options.symbols) {
    chars += SYMBOLS
  }

  if (!chars) {
    throw new Error('至少选择一种字符类型')
  }

  return chars
}

export function generateRandomString(
  length: number,
  options: CharSetOptions
): string {
  if (length < 1) {
    throw new Error('长度至少为 1')
  }
  if (length > 1024) {
    throw new Error('长度最大为 1024')
  }

  const chars = getCharSet(options)
  const charsArray = chars.split('')
  const randomBytes = getRandomValues(length)
  let result = ''

  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % charsArray.length
    result += charsArray[index]
  }

  return result
}

export function generateMultipleStrings(
  count: number,
  length: number,
  options: CharSetOptions
): string[] {
  if (count < 1) {
    throw new Error('数量至少为 1')
  }
  if (count > 100) {
    throw new Error('数量最大为 100')
  }

  const result: string[] = []
  for (let i = 0; i < count; i++) {
    result.push(generateRandomString(length, options))
  }
  return result
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  let poolSize = 0

  if (!password) {
    return { score: 0, label: '无', color: 'bg-gray-300', entropy: 0 }
  }

  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumbers = /[0-9]/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  if (hasLowercase) poolSize += 26
  if (hasUppercase) poolSize += 26
  if (hasNumbers) poolSize += 10
  if (hasSymbols) poolSize += 32

  const length = password.length
  
  if (length >= 8) score += 1
  if (length >= 12) score += 1
  if (length >= 16) score += 1
  if (length >= 20) score += 1

  if (hasLowercase) score += 1
  if (hasUppercase) score += 1
  if (hasNumbers) score += 1
  if (hasSymbols) score += 1

  if (/([a-z]{3,})/.test(password)) score -= 1
  if (/([A-Z]{3,})/.test(password)) score -= 1
  if (/([0-9]{3,})/.test(password)) score -= 1

  const repeated = /(.)\1{2,}/.test(password)
  if (repeated) score -= 1

  const entropy = length * Math.log2(Math.max(poolSize, 1))

  score = Math.max(0, Math.min(4, score))

  let label: string
  let color: string

  switch (score) {
    case 0:
      label = '极弱'
      color = 'bg-gray-300'
      break
    case 1:
      label = '弱'
      color = 'bg-red-500'
      break
    case 2:
      label = '中等'
      color = 'bg-orange-500'
      break
    case 3:
      label = '强'
      color = 'bg-yellow-500'
      break
    case 4:
    default:
      label = '极强'
      color = 'bg-green-500'
      break
  }

  return { score, label, color, entropy }
}

export function getDefaultCharSetOptions(): CharSetOptions {
  return {
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: false,
    excludeAmbiguous: false
  }
}
