/* @flow */

import $get from 'lodash/get'
import $set from 'lodash/set'
import $cloneDeep from 'lodash/cloneDeep'
import chokidar from 'chokidar'
import * as Helpers from './helpers'

async function getConfigFile(filePath: string, givenDefaultValue: ?Object = null, givenConfig: ?Object = null) {
  const config = Helpers.fillConfig(givenConfig || {})
  const defaultValue = givenDefaultValue || {}
  const watcher = chokidar.watch(filePath)

  let fileChanged = false
  let queue = Promise.resolve()
  let contents = await Helpers.readFile(filePath)

  async function refreshFileAsync() {
    if (!fileChanged) return
    const newContents = await Helpers.readFile(filePath)
    contents = newContents
    fileChanged = false
  }
  function refreshFileSync() {
    if (!fileChanged) return
    const newContents = Helpers.readFileSync(filePath)
    contents = newContents
    fileChanged = false
  }

  watcher.on('change', function() {
    fileChanged = true
    queue = queue.then(() => refreshFileAsync())
  })

  const configFile = {
    async get(path: string) {
      await queue
      let value = $get(contents, path)
      if (typeof value === 'undefined') {
        value = $get(defaultValue, path)
      }
      return value
    },
    getSync(path: string) {
      refreshFileSync()
      let value = $get(contents, path)
      if (typeof value === 'undefined') {
        value = $get(defaultValue, path)
      }
      return value
    },
    async set(path: string, value: any) {
      await queue
      const newContents = $set($cloneDeep(contents), path, value)
      contents = newContents
      await Helpers.writeFile(filePath, newContents, config)
    },
    setSync(path: string, value: any) {
      refreshFileSync()
      const newContents = $set($cloneDeep(contents), path, value)
      contents = newContents
      Helpers.writeFileSync(filePath, newContents, config)
    },
    async delete(path: string) {
      await configFile.set(path, undefined)
    },
    deleteSync(path: string) {
      configFile.setSync(path, undefined)
    },
    dispose() {
      watcher.close()
    },
  }

  return configFile
}

export default getConfigFile
