const namedEntities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': '\u00A0',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&sect;': '§',
  '&para;': '¶',
  '&middot;': '·',
  '&ndash;': '–',
  '&mdash;': '—',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&hellip;': '…',
  '&dagger;': '†',
  '&Dagger;': '‡',
  '&permil;': '‰',
  '&micro;': 'µ',
  '&deg;': '°',
  '&plusmn;': '±',
  '&sup2;': '²',
  '&sup3;': '³',
  '&frac14;': '¼',
  '&frac12;': '½',
  '&frac34;': '¾'
}

const reverseEntities: Record<string, string> = {}
for (const [entity, char] of Object.entries(namedEntities)) {
  reverseEntities[char] = entity
}

export function escapeHtml(text: string, useNamed = true): string {
  if (useNamed) {
    let result = ''
    for (const char of text) {
      if (reverseEntities[char]) {
        result += reverseEntities[char]
      } else if (char.charCodeAt(0) > 127) {
        result += `&#${char.charCodeAt(0)};`
      } else {
        result += char
      }
    }
    return result
  } else {
    return text.replace(/[\u00A0-\u9999<>\&"']/g, c => `&#${c.charCodeAt(0)};`)
  }
}

export function unescapeHtml(text: string): string {
  let result = text
  result = result.replace(/&([a-zA-Z]+);/g, (match, name) => {
    const entity = `&${name};`
    return namedEntities[entity] || match
  })
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  return result
}
