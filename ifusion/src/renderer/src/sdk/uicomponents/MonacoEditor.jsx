import React from 'react'
import { useState } from 'react'

import { Editor, loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

function MonacoEditor() {
  loader.config({ monaco })
  return (
    <Editor
      height="90vh"
      defaultLanguage="javascript"
      defaultValue="// some comment"
      onError={(error) => {
        console.error('Monaco Editor error:', error)
      }}
    />
  )
}

export default MonacoEditor
