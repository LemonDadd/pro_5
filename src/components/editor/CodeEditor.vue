<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, highlightActiveLine } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { cn } from '@/utils/cn'
import { useTheme } from '@/composables/useTheme'

interface Props {
  modelValue: string
  lang?: 'text' | 'json'
  readonly?: boolean
  lineWrapping?: boolean
  errorLine?: number
  class?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  lang: 'text',
  readonly: false,
  lineWrapping: true,
  placeholder: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
let editorView: EditorView | null = null
const { isDark } = useTheme()

const classes = computed(() => cn(
  'h-full overflow-hidden rounded-md border border-input bg-background',
  props.class
))

function createEditor() {
  if (!editorRef.value) return

  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab
    ]),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const value = update.state.doc.toString()
        emit('update:modelValue', value)
        emit('change', value)
      }
    }),
    EditorView.theme({
      '&': {
        height: '100%',
        fontSize: '13px'
      },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace"
      },
      '.cm-content': {
        padding: '8px 0'
      },
      '.cm-line': {
        padding: '0 16px'
      },
      '.cm-gutters': {
        paddingRight: '8px'
      }
    })
  ]

  if (props.lang === 'json') {
    extensions.push(json())
  }

  if (props.readonly) {
    extensions.push(EditorView.editable.of(false))
  }

  if (isDark.value) {
    extensions.push(oneDark)
  }

  const state = EditorState.create({
    doc: props.modelValue,
    extensions
  })

  editorView = new EditorView({
    state,
    parent: editorRef.value
  })
}

function updateContent(value: string) {
  if (!editorView) return
  const currentValue = editorView.state.doc.toString()
  if (value !== currentValue) {
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: value
      }
    })
  }
}

watch(() => props.modelValue, (newVal) => {
  updateContent(newVal)
})

watch(isDark, () => {
  if (editorView) {
    editorView.destroy()
    createEditor()
  }
})

onMounted(() => {
  createEditor()
})

onBeforeUnmount(() => {
  if (editorView) {
    editorView.destroy()
    editorView = null
  }
})

function getValue(): string {
  return editorView?.state.doc.toString() || ''
}

defineExpose({
  getValue,
  focus: () => editorView?.focus()
})
</script>

<template>
  <div :class="classes" class="code-editor-wrapper">
    <div ref="editorRef" class="h-full" />
  </div>
</template>

<style scoped>
.code-editor-wrapper :deep(.cm-editor) {
  height: 100%;
}

.code-editor-wrapper :deep(.cm-scroller) {
  overflow: auto;
}
</style>
