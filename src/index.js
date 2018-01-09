/* @flow */

import $get from 'lodash/get'
import $set from 'lodash/set'
import $omit from 'lodash/omit'
import $cloneDeep from 'lodash/cloneDeep'
import chokidar from 'chokidar'
import * as Helpers from './helpers'
import type { Path } from './types'

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
    async get(path: Path = null) {
      await queue
      let value
      if (path === null) {
        value = contents
      } else {
        value = $get(contents, path)
      }
      if (typeof value === 'undefined') {
        value = $get(defaultValue, path)
      }
      return $cloneDeep(value)
    },
    getSync(path: Path = null) {
      refreshFileSync()
      let value
      if (path === null) {
        value = contents
      } else {
        value = $get(contents, path)
      }
      if (typeof value === 'undefined') {
        value = $get(defaultValue, path)
      }
      return $cloneDeep(value)
    },
    async set(path: Path, value: any) {
      await queue
      let newContents
      if (path === null) {
        newContents = value
      } else {
        newContents = $set($cloneDeep(contents), path, value)
      }
      contents = newContents
      await Helpers.writeFile(filePath, newContents, config)
    },
    setSync(path: Path, value: any) {
      refreshFileSync()
      let newContents
      if (path === null) {
        newContents = value
      } else {
        newContents = $set($cloneDeep(contents), path, value)
      }
      contents = newContents
      Helpers.writeFileSync(filePath, newContents, config)
    },
    async delete(path: Path) {
      await queue
      let newContents
      if (path === null) {
        newContents = {}
      } else {
        newContents = $omit($cloneDeep(contents), path)
      }
      contents = newContents
      await Helpers.writeFile(filePath, newContents, config)
    },
    deleteSync(path: Path) {
      refreshFileSync()
      let newContents
      if (path === null) {
        newContents = {}
      } else {
        newContents = $omit($cloneDeep(contents), path)
      }
      contents = newContents
      Helpers.writeFileSync(filePath, newContents, config)
    },
    dispose() {
      watcher.close()
    },
  }

  return configFile
}

export default getConfigFile
