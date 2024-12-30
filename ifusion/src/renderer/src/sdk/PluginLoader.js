class PluginLoader {
  constructor(pluginsDir) {
    this.pluginsDir = pluginsDir
    this.plugins = []
  }

  loadPlugins() {
    return new Promise((resolve, reject) => {
      const fs = window.api.fs
      const path = window.api.path
      console.log(this.pluginsDir)
      if (!fs.existsSync(this.pluginsDir)) {
        console.warn(`Plugins directory not found: ${this.pluginsDir}`)
        return reject(new Error('Plugins directory not found'))
      }

      const pluginDirs = fs.readdirSync(this.pluginsDir)
      pluginDirs.forEach((pluginDir) => {
        const pluginPath = path.join(this.pluginsDir, pluginDir)
        const manifestPath = path.join(pluginPath, 'manifest.json')

        if (fs.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))

            if (manifest.name && manifest.main && manifest.component) {
              const mainPath = path.join(pluginPath, manifest.main)
              const componentPath = path.join(pluginPath, manifest.component)

              if (fs.existsSync(mainPath) && fs.existsSync(componentPath)) {
                const pluginModule = require(mainPath)
                const pluginComponent = require(componentPath).default

                if (typeof pluginModule.execute === 'function') {
                  this.plugins.push({
                    name: manifest.name,
                    description: manifest.description || '',
                    execute: pluginModule.execute,
                    component: pluginComponent
                  })
                } else {
                  console.warn(`Plugin "${manifest.name}" is missing the execute function.`)
                }
              } else {
                console.warn(`Main or component file not found for plugin "${manifest.name}"`)
              }
            }
          } catch (err) {
            console.error(`Error parsing manifest.json for plugin "${pluginDir}":`, err)
          }
        }
      })

      resolve()
    })
  }

  listPlugins() {
    return this.plugins.map(({ name, description }) => ({ name, description }))
  }

  executePlugin(pluginName, input) {
    const plugin = this.plugins.find((p) => p.name === pluginName)

    if (!plugin) {
      throw new Error(`Plugin "${pluginName}" not found.`)
    }

    const result = plugin.execute(input)
    return { result: result.result, component: plugin.component }
  }
}

export default PluginLoader
