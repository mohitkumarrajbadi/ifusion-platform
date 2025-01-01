import React, { useState, useEffect, Suspense, lazy } from 'react'
import MonacoEditor from './uicomponents/MonacoEditor'

// Define the Loading component
const Loading = () => <div>Loading...</div>

const PluginManager = () => {
  const [plugins, setPlugins] = useState([])
  const [error, setError] = useState(null)
  const [selectedPlugin, setSelectedPlugin] = useState(null) // Track selected plugin

  useEffect(() => {
    const fetchPlugins = async () => {
      try {
        const pluginsFolderPath = await window.api.path.resolve('..', 'ifusion-plugins')
        console.log(`[INFO] Checking plugins in: ${pluginsFolderPath}`)

        // Check if the folder exists
        const folderExists = await new Promise((resolve, reject) => {
          window.api.fs.exists(pluginsFolderPath, (exists) => {
            if (exists) resolve(true)
            else reject(new Error(`Plugins folder not found: ${pluginsFolderPath}`))
          })
        })

        if (!folderExists) return

        // Read the directory contents
        const directories = await new Promise((resolve, reject) => {
          window.api.fs.readdir(pluginsFolderPath, { withFileTypes: true }, (err, files) => {
            if (err) reject(err)
            else resolve(files)
          })
        })

        console.log(`[DEBUG] Contents of ifusion-plugins folder:`, directories)

        const pluginData = await Promise.all(
          directories
            .filter((dirent) => dirent.isDirectory())
            .map(async (dirent) => {
              const pluginPath = `${pluginsFolderPath}/${dirent.name}`
              const manifestPath = `${pluginPath}/manifest.json`

              // Check if manifest exists
              const hasManifest = await new Promise((resolve) => {
                window.api.fs.exists(manifestPath, (exists) => resolve(exists))
              })

              if (hasManifest) {
                // Read the manifest file
                const manifest = await new Promise((resolve, reject) => {
                  window.api.fs.readFile(manifestPath, 'utf-8', (err, data) => {
                    if (err) reject(err)
                    else resolve(JSON.parse(data))
                  })
                })

                console.log(`[DEBUG] Manifest for ${dirent.name}:`, manifest)

                // Lazy load the main component from the manifest's "main" property
                const MainComponent = lazy(
                  () => import(/* @vite-ignore */ `${pluginPath}/${manifest.main}`)
                )

                return {
                  name: dirent.name,
                  hasManifest,
                  manifest,
                  MainComponent,
                  pluginPath // Store the plugin path
                }
              }
              return null
            })
        )

        // Filter out null results (if no manifest was found)
        const filteredPlugins = pluginData.filter((plugin) => plugin !== null)

        console.log(`[INFO] Processed plugin data:`, filteredPlugins)

        setPlugins(filteredPlugins)
      } catch (err) {
        setError('Failed to load plugins. Check the logs for details.')
        console.error(`[ERROR] Error fetching plugins:`, err)
      }
    }

    fetchPlugins()
  }, [])

  const handlePluginClick = (plugin) => {
    setSelectedPlugin(plugin) // Set the selected plugin
  }

  return (
    <div>
      <h2>Plugin Manager</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!error && plugins.length === 0 && <div>Loading plugins...</div>}
      <div style={{ display: 'flex' }}>
        <ul style={{ flex: 1, paddingRight: '20px' }}>
          {plugins.map((plugin, index) => (
            <li key={index} style={{ marginBottom: '20px' }}>
              <div>
                <h3>{plugin.manifest.name}</h3>
                <p>{plugin.manifest.description}</p>
                <p>Version: {plugin.manifest.version}</p>
                {plugin.manifest.icon && (
                  <img
                    src={`${plugin.pluginPath}/${plugin.manifest.icon}`} // Dynamically load image
                    alt="Plugin Icon"
                    style={{ width: '50px', height: '50px', marginBottom: '10px' }}
                  />
                )}
                <button onClick={() => handlePluginClick(plugin)}>View Plugin</button>
              </div>
            </li>
          ))}
        </ul>

        {/* Display selected plugin's component */}
        {selectedPlugin && (
          <div style={{ flex: 2, paddingLeft: '20px', borderLeft: '1px solid #ccc' }}>
            <h3>{selectedPlugin.manifest.name} Plugin</h3>
            <Suspense fallback={<Loading />}>
              <selectedPlugin.MainComponent />
            </Suspense>
          </div>
        )}
      </div>
      <p>Total Plugins: {plugins.length}</p>
    </div>
  )
}

export default PluginManager
