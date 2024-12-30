import React, { useState } from 'react';
import PluginManager from './sdk/PluginManager';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <PluginManager
      pluginsDir="../../src/renderer/src/plugins"
      onThemeToggle={toggleTheme}
      isDarkMode={isDarkMode}
    />
  );
}

export default App;
