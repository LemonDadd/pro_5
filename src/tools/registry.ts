import { defineTool } from './types'
import Base64Tool from '@/views/tools/Base64Tool.vue'
import UrlTool from '@/views/tools/UrlTool.vue'
import HtmlEntityTool from '@/views/tools/HtmlEntityTool.vue'
import UnicodeTool from '@/views/tools/UnicodeTool.vue'
import JsonTool from '@/views/tools/JsonTool.vue'
import JwtTool from '@/views/tools/JwtTool.vue'

const tools = [
  defineTool({
    id: 'base64',
    name: { zh: 'Base64 编解码', en: 'Base64 Encoder/Decoder' },
    description: {
      zh: '支持文本和文件的 Base64 编解码，标准/URL-safe 模式切换',
      en: 'Base64 encode/decode for text and files, standard/URL-safe mode'
    },
    icon: 'Binary',
    category: 'encode',
    keywords: ['base64', '编码', '解码', 'encode', 'decode', 'base64编码', 'base64解码'],
    path: '/tool/base64',
    component: Base64Tool,
    options: [
      {
        key: 'urlSafe',
        type: 'switch',
        label: { zh: 'URL-safe 模式', en: 'URL-safe mode' },
        defaultValue: false
      }
    ]
  }),
  defineTool({
    id: 'url',
    name: { zh: 'URL 编解码', en: 'URL Encoder/Decoder' },
    description: {
      zh: 'URL 编码/解码，URL 解析与批量处理',
      en: 'URL encode/decode, URL parsing and batch processing'
    },
    icon: 'Link',
    category: 'encode',
    keywords: ['url', '编码', '解码', 'encode', 'decode', '链接', 'parse', '解析'],
    path: '/tool/url',
    component: UrlTool
  }),
  defineTool({
    id: 'html-entity',
    name: { zh: 'HTML 实体编解码', en: 'HTML Entity Encoder/Decoder' },
    description: {
      zh: 'HTML 实体转义与反转义，沙箱预览',
      en: 'HTML entity escape/unescape with sandbox preview'
    },
    icon: 'Code',
    category: 'encode',
    keywords: ['html', 'entity', '实体', '转义', 'escape', 'unescape', 'xss'],
    path: '/tool/html-entity',
    component: HtmlEntityTool
  }),
  defineTool({
    id: 'unicode',
    name: { zh: 'Unicode 转换', en: 'Unicode Converter' },
    description: {
      zh: '文本与 Unicode 码点互转，Emoji 码点查询',
      en: 'Text to Unicode code points, Emoji code point lookup'
    },
    icon: 'Type',
    category: 'convert',
    keywords: ['unicode', '编码', '转换', 'emoji', '码点', 'code point', 'utf'],
    path: '/tool/unicode',
    component: UnicodeTool
  }),
  defineTool({
    id: 'json',
    name: { zh: 'JSON 工具', en: 'JSON Tools' },
    description: {
      zh: 'JSON 格式化、压缩、校验、排序与转换',
      en: 'JSON format, compress, validate, sort and convert'
    },
    icon: 'Braces',
    category: 'format',
    keywords: ['json', '格式化', '压缩', '校验', 'yaml', 'format', 'validate', 'sort'],
    path: '/tool/json',
    component: JsonTool
  }),
  defineTool({
    id: 'jwt',
    name: { zh: 'JWT 解析', en: 'JWT Parser' },
    description: {
      zh: 'JWT 令牌解析，Header/Payload 解码与过期时间显示',
      en: 'JWT token parser, Header/Payload decode and expiry display'
    },
    icon: 'KeyRound',
    category: 'crypto',
    keywords: ['jwt', 'token', '令牌', '解析', 'decode', 'json web token'],
    path: '/tool/jwt',
    component: JwtTool
  })
]

export const toolRegistry = {
  getTools() {
    return tools
  },

  getToolById(id: string) {
    return tools.find(t => t.id === id)
  },

  getToolsByCategory(category: string) {
    return tools.filter(t => t.category === category)
  },

  getCategories() {
    const categories = [...new Set(tools.map(t => t.category))]
    return categories
  },

  searchTools(query: string) {
    if (!query.trim()) return tools
    const lowerQuery = query.toLowerCase()
    return tools.filter(t => {
      return (
        t.name.zh.toLowerCase().includes(lowerQuery) ||
        t.name.en.toLowerCase().includes(lowerQuery) ||
        t.id.toLowerCase().includes(lowerQuery) ||
        t.keywords.some(k => k.toLowerCase().includes(lowerQuery))
      )
    })
  }
}
