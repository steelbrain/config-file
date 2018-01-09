/* @flow */

import FS from 'sb-fs'
import stripBom from 'strip-bom'
import atomicWrite from 'write-file-atomic'
import type { Config } from './types'

export function fillConfig(given: Object): Config {
  const config = {}

  if (typeof given.prettyPrint !== 'undefined') {
    config.prettyPrint = !!given.prettyPrint
  } else config.prettyPrint = true
  if (typeof given.atomicWrites !== 'undefined') {
    config.atomicWrites = !!given.atomicWrites
  } else config.atomicWrites = true

  return config
}

export function writeFile(filePath: string, contents: Object, config: Config): Promise<void> {
  const stringified = `${JSON.stringify(contents, null, config.prettyPrint ? 2 : 0)}\n`
  if (config.atomic) {
    return new Promise(function(resolve, reject) {
      atomicWrite(filePath, stringified, function(err) {
        if (err) reject()
        else resolve()
      })
    })
  }
  return FS.writeFile(filePath, stringified)
}

export function writeFileSync(filePath: string, contents: Object, config: Config): void {
  const stringified = `${JSON.stringify(contents, null, config.prettyPrint ? 2 : 0)}\n`
  if (config.atomic) {
    atomicWrite.sync(filePath, stringified)
  } else {
    FS.writeFileSync(filePath, stringified)
  }
}

export async function readFile(filePath: string, initialValue: Object): Promise<Object> {
  let contents
  try {
    contents = stripBom(await FS.readFile(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      return Object.assign({}, initialValue)
    }
    throw error
  }
  try {
    return Object.assign({}, initialValue, JSON.parse(contents))
  } catch (_) {
    throw new Error(`Invalid JSON found at '${filePath}'`)
  }
}

export function readFileSync(filePath: string, initialValue: Object): Object {
  let contents
  try {
    contents = stripBom(FS.readFileSync(filePath, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') {
      return Object.assign({}, initialValue)
    }
    throw error
  }
  try {
    return Object.assign({}, initialValue, JSON.parse(contents))
  } catch (_) {
    throw new Error(`Invalid JSON found at '${filePath}'`)
  }
}
