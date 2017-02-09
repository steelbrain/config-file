/* @flow */

import FS from 'fs'
import stripBom from 'strip-bom'
import atmoicWrite from 'write-file-atomic'
import stripComments from 'strip-json-comments'
import type { Options } from './types'

export function fillOptions(given: Object): Options {
  const options = {}

  options.noPrettyPrint = !!given.noPrettyPrint
  options.failIfNonExistent = !!given.failIfNonExistent

  return options
}

export function split(path: string): Array<string> {
  return path.split('.').filter(i => i)
}

export function getKeys(path: string): { childKey: string, parentKey: string } {
  const chunks = split(path)
  const childKey = chunks.pop()
  const parentKey = chunks.join('.')
  return { childKey, parentKey }
}

export function readFile(filePath: string, defaultConfig: Object): Object {
  const contents = stripComments(stripBom(FS.readFileSync(filePath, 'utf8')))
  try {
    return Object.assign(defaultConfig, JSON.parse(contents))
  } catch (_) {
    throw new Error(`Invalid JSON found at '${filePath}'`)
  }
}

export function writeFile(filePath: string, contents: Object, options: Options): void {
  const encoded = JSON.stringify(contents, null, options.noPrettyPrint ? 0 : 2)
  atmoicWrite.sync(filePath, encoded + '\n')
}

export function deepGet(object: Object, chunks: Array<string>, position: number = 0): any {
  if (!chunks.length) {
    return object
  }

  const current = object[chunks[position]]
  if (chunks.length === position + 1) {
    return current
  }
  if (typeof current !== 'object' || !current) {
    const error = new Error(`Invalid access of '${chunks.join('.')}' when '${chunks.slice(0, position).join('.')}' is ${typeof current}`)
    // $FlowIgnore: Custom prop
    error.code = 'CONFIG_INVALID_ACCESS'
    throw error
  }
  return deepGet(current, chunks, position + 1)
}

export function deepNormalize(object: Object, chunks: Array<string>, strict: boolean, position: number = 0): any {
  if (!chunks.length) {
    return object
  }

  let current = object[chunks[position]]

  if (typeof current === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    current = object[chunks[position]] = {}
  }
  if (typeof current !== 'object' || !current) {
    if (strict) {
      const error = new Error(`Invalid access of '${chunks.join('.')}' when '${chunks.slice(0, position).join('.')}' is ${typeof current}`)
      // $FlowIgnore: Custom prop
      error.code = 'CONFIG_INVALID_ACCESS'
      throw error
    } else {
      // eslint-disable-next-line no-param-reassign
      current = object[chunks[position]] = {}
    }
  }
  if (chunks.length === position + 1) {
    return current
  }
  return deepNormalize(current, chunks, strict, position + 1)
}
