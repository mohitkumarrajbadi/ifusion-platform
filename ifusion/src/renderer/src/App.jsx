import React, { useEffect, useState } from 'react'
import PluginManager from './sdk/PluginManager'

const App = () => {
  return (
    <div>
      <h1>My Modular App</h1>
      <PluginManager />
    </div>
  )
}

export default App
