/* @flow */

import FS from 'sb-fs'
import * as Helpers from './helpers'
import * as ObjectPath from './object-path'
import type { Config } from './types'

const PRIVATE_VAR = {}
class ConfigFile {
  config: Config;
  filePath: string;
  initialValue: Object;
  constructor(privateVar: Object, filePath: string, initialValue: Object, config: Config) {
    if (privateVar !== PRIVATE_VAR) {
      throw new Error('Invalid invocation of new ConfigFile() use ConfigFile.get() instead')
    }

    this.config = config
    this.filePath = filePath
    this.initialValue = initialValue
  }
  async get(key: string = '', defaultValue: any = null): any {
    return this._get(key, defaultValue, await Helpers.readFile(this.filePath, this.initialValue))
  }
  getSync(key: string = '', defaultValue: any = null): any {
    return this._get(key, defaultValue, Helpers.readFileSync(this.filePath, this.initialValue))
  }
  _get(key: string, defaultValue: any, contents: Object): any {
    try {
      const value = ObjectPath.deepGet(contents, ObjectPath.split(key))
      if (typeof value === 'undefined') {
        return defaultValue
      }
      return value
    } catch (error) {
      return null
    }
  }
  async set(key: string, value: any, strict: boolean = false) {
    await Helpers.writeFile(this.filePath, this._set(key, value, strict, await Helpers.readFile(this.filePath, this.initialValue)), this.config)
  }
  setSync(key: string, value: any, strict: boolean = false) {
    Helpers.writeFileSync(this.filePath, this._set(key, value, strict, Helpers.readFileSync(this.filePath, this.initialValue)), this.config)
  }
  _set(key: string, value: any, strict: boolean = false, contents: Object) {
    const { childKey, parentKey } = ObjectPath.getKeys(key)
    const parent = ObjectPath.deepNormalize(contents, ObjectPath.split(parentKey), strict)
    if (Array.isArray(parent)) {
      const index = parseInt(childKey, 10)
      if (index !== index) {
        throw new Error(`Invalid write of non-numeric key on Array at '${key}'`)
      }
      parent[index] = value
    } else {
      parent[childKey] = value
    }
    return contents
  }
  async delete(key: string, strict: boolean = false) {
    await Helpers.writeFile(this.filePath, this._delete(key, strict, await Helpers.readFile(this.filePath, this.initialValue)), this.config)
  }
  deleteSync(key: string, strict: boolean = false) {
    Helpers.writeFileSync(this.filePath, this._delete(key, strict, Helpers.readFileSync(this.filePath, this.initialValue)), this.config)
  }
  _delete(key: string, strict: boolean = false, contents: Object) {
    const { childKey, parentKey } = ObjectPath.getKeys(key)
    const parent = ObjectPath.deepNormalize(contents, ObjectPath.split(parentKey), strict)
    delete parent[childKey]
    return contents
  }
  async append(key: string, value: any, strict: boolean = false) {
    await Helpers.writeFile(this.filePath, this._append(key, value, strict, await Helpers.readFile(this.filePath, this.initialValue)), this.config)
  }
  appendSync(key: string, value: any, strict: boolean = false) {
    Helpers.writeFileSync(this.filePath, this._append(key, value, strict, Helpers.readFileSync(this.filePath, this.initialValue)), this.config)
  }
  _append(key: string, value: any, strict: boolean = false, contents: Object) {
    const parent = ObjectPath.deepNormalize(contents, ObjectPath.split(key), strict)
    if (!Array.isArray(parent)) {
      const error = new Error(`Invalid write of '${key}' when it's not an Array`)
      // $FlowIgnore: Custom prop
      error.code = 'CONFIG_INVALID_ACCESS'
      throw error
    }
    parent.push(value)
    return contents
  }
  static async get(filePath: string, givenInitialValue: ?Object = {}, givenConfig: ?Object = {}) {
    const config = Helpers.fillConfig(givenConfig || {})
    const initialValue = givenInitialValue || {}

    if (!await FS.exists(filePath) && config.createIfNonExistent) {
      await Helpers.writeFile(filePath, initialValue, config)
    }
    return new ConfigFile(PRIVATE_VAR, filePath, initialValue, config)
  }
}

module.exports = ConfigFile
