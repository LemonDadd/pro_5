import type { Component } from 'vue'

export type ToolCategory = 'encode' | 'convert' | 'format' | 'crypto' | 'time'

export interface ToolOption {
  key: string
  type: 'switch' | 'select' | 'input'
  label: { zh: string; en: string }
  defaultValue: any
  options?: { value: string; label: { zh: string; en: string } }[]
}

export interface ToolDefinition {
  id: string
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  icon: string
  category: ToolCategory
  keywords: string[]
  path: string
  component: Component
  options?: ToolOption[]
}

export function defineTool(def: ToolDefinition): ToolDefinition {
  return def
}
