import React, { useState, useEffect, Suspense } from 'react'

// Assuming ErrorComponent is defined somewhere to handle errors gracefully
function ErrorComponent() {
  return <div>Error loading plugin component.</div>
}

function PluginManager({ pluginsDir, onThemeToggle, isDarkMode }) {
  const [plugins, setPlugins] = useState([])
  const [activePluginComponent, setActivePluginComponent] = useState(null)
  const [pluginResult, setPluginResult] = useState('')

  useEffect(() => {
    const loadPlugins = async () => {
      const fs = window.api.fs
      const path = window.api.path

      const resolvedPluginsDir = path.resolve(__dirname, pluginsDir)
      if (!fs.existsSync(resolvedPluginsDir)) {
        console.warn(`Plugins directory not found: ${resolvedPluginsDir}`)
        return
      }

      const pluginDirs = fs.readdirSync(resolvedPluginsDir)
      const loadedPlugins = []

      for (const pluginDir of pluginDirs) {
        const pluginPath = path.join(resolvedPluginsDir, pluginDir)
        const manifestPath = path.join(pluginPath, 'manifest.json')

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
            if (manifest.name && manifest.main && manifest.component) {
              const mainPath = path.join(pluginPath, manifest.main)
              const componentPath = path.join(pluginPath, manifest.component)

              if (fs.existsSync(mainPath) && fs.existsSync(componentPath)) {
                const pluginModule = require(mainPath)

                if (typeof pluginModule.execute === 'function') {
                  loadedPlugins.push({
                    name: manifest.name,
                    description: manifest.description || '',
                    execute: pluginModule.execute,
                    componentName: manifest.component
                  })
                } else {
                  console.warn(`Plugin "${manifest.name}" is missing the execute function.`)
                }
              } else {
                console.warn(`Main or component file not found for plugin "${manifest.name}".`)
              }
            }
          } catch (err) {
            console.error(`Error parsing manifest.json for plugin "${pluginDir}":`, err)
          }
        }
      }

      setPlugins(loadedPlugins)
    }

    loadPlugins()
  }, [pluginsDir])

  const executePlugin = async (pluginName, input) => {
    console.log(`Executing plugin: ${pluginName} with input: ${input}`)
    const selectedPlugin = plugins.find((p) => p.name === pluginName)

    if (!selectedPlugin) {
      console.error(`Plugin "${pluginName}" not found.`)
      return
    }

    try {
      console.log(`Found plugin "${pluginName}". Executing its logic...`)
      const result = selectedPlugin.execute(input)
      console.log('Execution result:', result)

      setPluginResult(result.result)

      const componentPath = result.component
      console.log('Component path:', componentPath)

      if (typeof componentPath === 'string') {
        const componentImportPath = `../../../src/renderer/src/plugins/${pluginName}/${componentPath}`
        console.log(`Importing from path: ${componentImportPath}`)

        const LazyComponent = React.lazy(() =>
          import(`${componentImportPath}`).catch((err) => {
            console.error('Error loading the component:', err)
            return { default: () => <ErrorComponent /> } // Return a fallback component
          })
        )

        setActivePluginComponent(LazyComponent)
      } else {
        console.error('Invalid component path:', componentPath)
      }
    } catch (error) {
      console.error(`Error executing plugin "${pluginName}":`, error.message)
    }
  }

  useEffect(() => {
    console.log('Active Plugin Component:', activePluginComponent)
  }, [activePluginComponent])

  return (
    <div
      className={`app ${isDarkMode ? 'dark' : 'light'}`}
      style={{ display: 'flex', height: '100vh' }}
    >
      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: isDarkMode ? '#333' : '#f4f4f4',
          color: isDarkMode ? '#fff' : '#000'
        }}
      >
        <h3>Plugins</h3>
        <button onClick={onThemeToggle} style={{ marginBottom: '10px' }}>
          Toggle Theme
        </button>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {plugins.map(({ name }) => (
            <li key={name} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => executePlugin(name, '{"key": "value"}')}
                style={{ width: '100%' }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          flex: 2,
          padding: '20px',
          backgroundColor: isDarkMode ? '#222' : '#fff',
          color: isDarkMode ? '#fff' : '#000'
        }}
      >
        {activePluginComponent ? (
          <div>
            <h3>Plugin Output</h3>
            <div>{pluginResult}</div>
            <Suspense fallback={<div>Loading plugin component...</div>}>
              {React.createElement(activePluginComponent)}
            </Suspense>
          </div>
        ) : (
          <p>Please select a plugin to see its output.</p>
        )}
      </div>
    </div>
  )
}

export default PluginManager
