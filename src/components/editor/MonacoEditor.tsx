import { useRef, useEffect } from 'react'
import Editor, { OnMount, OnChange } from '@monaco-editor/react'
import { useApp } from '../../store/AppContext'

interface MonacoEditorProps {
  value: string
  language: string
  onChange: (value: string) => void
  filePath?: string
}

const claudeDarkTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '8b949e', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'ff7b72' },
    { token: 'string', foreground: 'a5d6ff' },
    { token: 'number', foreground: '79c0ff' },
    { token: 'type', foreground: 'ffa657' },
    { token: 'class', foreground: 'ffa657' },
    { token: 'function', foreground: 'd2a8ff' },
    { token: 'variable', foreground: 'e6edf3' },
    { token: 'operator', foreground: 'ff7b72' },
    { token: 'delimiter', foreground: '8b949e' },
    { token: 'tag', foreground: '7ee787' },
    { token: 'attribute.name', foreground: '79c0ff' },
    { token: 'attribute.value', foreground: 'a5d6ff' },
    { token: 'regexp', foreground: 'a5d6ff' },
    { token: 'annotation', foreground: 'ffa657' },
    { token: 'constant', foreground: '79c0ff' },
  ],
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editor.lineHighlightBackground': '#161b2280',
    'editor.selectionBackground': '#264f7840',
    'editor.inactiveSelectionBackground': '#264f7820',
    'editorLineNumber.foreground': '#484f58',
    'editorLineNumber.activeForeground': '#e6edf3',
    'editorCursor.foreground': '#58a6ff',
    'editor.findMatchBackground': '#9e6a03aa',
    'editor.findMatchHighlightBackground': '#f2cc6044',
    'editorBracketMatch.background': '#3fb95020',
    'editorBracketMatch.border': '#3fb95040',
    'editorGutter.background': '#0d1117',
    'editorWidget.background': '#161b22',
    'editorWidget.border': '#30363d',
    'editorSuggestWidget.background': '#161b22',
    'editorSuggestWidget.border': '#30363d',
    'editorSuggestWidget.selectedBackground': '#30363d80',
    'editorHoverWidget.background': '#161b22',
    'editorHoverWidget.border': '#30363d',
    'input.background': '#0d1117',
    'input.border': '#30363d',
    'input.foreground': '#e6edf3',
    'focusBorder': '#58a6ff',
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#30363d80',
    'scrollbarSlider.hoverBackground': '#484f5880',
    'scrollbarSlider.activeBackground': '#484f58',
    'minimap.background': '#0d1117',
  },
}

export default function MonacoEditorComponent({ value, language, onChange, filePath }: MonacoEditorProps) {
  const { state } = useApp()
  const editorRef = useRef<any>(null)

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // Define theme
    monaco.editor.defineTheme('claude-dark', claudeDarkTheme)
    monaco.editor.setTheme('claude-dark')

    // Focus editor
    editor.focus()

    // Add keyboard shortcuts
    editor.addAction({
      id: 'save-file',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        // Trigger save via custom event
        window.dispatchEvent(new CustomEvent('editor-save'))
      },
    })
  }

  const handleChange: OnChange = (val) => {
    onChange(val || '')
  }

  // Update theme when settings change
  useEffect(() => {
    if (editorRef.current) {
      const monaco = (window as any).monaco
      if (monaco) {
        monaco.editor.defineTheme('claude-dark', claudeDarkTheme)
        monaco.editor.setTheme('claude-dark')
      }
    }
  }, [state.settings.editor.theme])

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={handleChange}
      onMount={handleMount}
      theme="claude-dark"
      path={filePath}
      options={{
        fontSize: state.settings.editor.fontSize,
        fontFamily: state.settings.editor.fontFamily,
        fontLigatures: true,
        tabSize: state.settings.editor.tabSize,
        wordWrap: state.settings.editor.wordWrap,
        minimap: {
          enabled: state.settings.editor.minimap,
          scale: 1,
          showSlider: 'mouseover',
        },
        lineNumbers: state.settings.editor.lineNumbers ? 'on' : 'off',
        renderLineHighlight: 'all',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        bracketPairColorization: { enabled: true },
        guides: {
          bracketPairs: true,
          indentation: true,
        },
        suggest: {
          preview: true,
          showMethods: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showKeywords: true,
          showWords: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
          showSnippets: true,
        },
        quickSuggestions: true,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        padding: { top: 8, bottom: 8 },
      }}
    />
  )
}
