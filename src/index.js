/* @flow */

import * as Helpers from './helpers'
import type { Options } from './types'

class ConfigFile {
  options: Options;
  filePath: string;
  defaultConfig: Object;
  constructor(filePath: string, defaultConfig: Object = {}, options: Object = {}) {
    this.options = Helpers.fillOptions(options)
    this.filePath = filePath
    this.defaultConfig = defaultConfig

    // To verify file doesn't have syntax errors
    Helpers.readFile(filePath, this.defaultConfig)
  }
  get(key: string, strict: boolean = false): any {
    const contents = Helpers.readFile(this.filePath, this.defaultConfig)
    try {
      return Helpers.deepGet(contents, key.split('.'))
    } catch (error) {
      if (error.code !== 'CONFIG_INVALID_ACCESS' || strict) {
        throw error
      }
      return null
    }
  }
  set(key: string, value: any, strict: boolean = false) {
    const contents = Helpers.readFile(this.filePath, this.defaultConfig)
    const { childKey, parentKey } = Helpers.getKeys(key)
    const parent = Helpers.deepNormalize(contents, parentKey.split('.'), strict)
    if (Array.isArray(parent)) {
      const index = parseInt(childKey, 10)
      if (index - 1 > parent.length) {
        parent.length = index - 1
      }
      parent[index] = value
    } else {
      parent[childKey] = value
    }
    Helpers.writeFile(this.filePath, contents)
  }
  append(key: string, value: any, strict: boolean = false) {
    const contents = Helpers.readFile(this.filePath, this.defaultConfig)
    const parent = Helpers.deepNormalize(contents, key.split('.'), strict)
    if (!Array.isArray(parent)) {
      const error = new Error(`Invalid write of '${key}' when it's not an Array`)
      // $FlowIgnore: Custom prop
      error.code = 'CONFIG_INVALID_ACCESS'
      throw error
    }
    parent.push(value)
    Helpers.writeFile(this.filePath, contents)
  }
}

module.exports = ConfigFile
