/* @flow */

import FS from 'fs'
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

    try {
      // To verify file doesn't have syntax errors
      Helpers.readFile(filePath, this.defaultConfig)
    } catch (error) {
      if (error.code === 'ENOENT') {
        if (this.options.failIfNonExistent) {
          const newError = new Error(`Config file '${filePath}' does not exist`)
          // $FlowIgnore: Custom prop
          newError.code = 'CONFIG_INVALID_ACCESS'
          throw newError
        }
        FS.writeFileSync(filePath, '{}\n')
      } else throw error
    }
  }
  get(key: string = '', defaultValue: any = null, strict: boolean = false): any {
    const contents = Helpers.readFile(this.filePath, this.defaultConfig)
    try {
      const value = Helpers.deepGet(contents, Helpers.split(key))
      if (typeof value === 'undefined') {
        return defaultValue
      }
      return value
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
    const parent = Helpers.deepNormalize(contents, Helpers.split(parentKey), strict)
    if (Array.isArray(parent)) {
      const index = parseInt(childKey, 10)
      if (index !== index) {
        throw new Error(`Invalid write of non-numeric key on Array at '${key}'`)
      }
      parent[index] = value
    } else {
      parent[childKey] = value
    }
    Helpers.writeFile(this.filePath, contents)
  }
  append(key: string, value: any, strict: boolean = false) {
    const contents = Helpers.readFile(this.filePath, this.defaultConfig)
    const parent = Helpers.deepNormalize(contents, Helpers.split(key), strict)
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
