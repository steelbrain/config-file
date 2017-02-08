/* @flow */

import FS from 'sb-fs'
import Path from 'path'
import copy from 'sb-copy'
import { it, beforeEach, afterEach } from 'jasmine-fix'

import ConfigFile from '../src'

describe('ConfigFile', function() {
  const fixtures = Path.join(__dirname, 'fixtures')
  const directory = Path.join(fixtures, 'ignored')
  const nonExistent = Path.join(directory, 'file-1')
  const configPath = Path.join(directory, 'config.json')

  beforeEach(async function() {
    await FS.mkdirp(Path.join(fixtures, 'ignored'))
    await copy(Path.join(fixtures, 'files'), Path.join(fixtures, 'ignored'))
  })
  afterEach(async function() {
    await FS.rimraf(Path.join(fixtures, 'ignored'))
  })

  it('creates empty if file is non existent', async function() {
    expect(await FS.exists(nonExistent)).toBe(false)
    // eslint-disable-next-line no-new
    new ConfigFile(nonExistent)
    expect(await FS.readFile(nonExistent, 'utf8')).toBe('{}\n')
  })
  it('fails if file is not present and config is set', async function() {
    const testFile = Path.join(directory, 'test-1')
    expect(await FS.exists(testFile)).toBe(false)
    try {
      // eslint-disable-next-line no-new
      new ConfigFile(testFile, {}, { failIfNonExistent: true })
      expect(false).toBe(true)
    } catch (error) {
      expect(error.code).toBe('CONFIG_INVALID_ACCESS')
    }
  })

  it('returns full object if get is empty', function() {
    const configFile = new ConfigFile(configPath)
    expect(configFile.get()).toEqual({
      array: ['1', 2, '5'],
      object: {
        deep: {
          prop: 'yes',
          ha: 1,
        },
      },
    })
  })
  it('returns deep stuff', function() {
    const configFile = new ConfigFile(configPath)
    expect(configFile.get('array')).toEqual(['1', 2, '5'])
    expect(configFile.get('array.1')).toEqual(2)
    expect(configFile.get('object.deep.prop')).toEqual('yes')
    expect(configFile.get('object.deep.ha')).toEqual(1)
  })

  it('writes deep stuff', function() {
    const configFile = new ConfigFile(configPath)

    // write a new object
    expect(configFile.get('new.deep.prop')).toEqual(null)
    configFile.set('new.deep.prop', 50)
    expect(configFile.get('new')).toEqual({
      deep: {
        prop: 50,
      },
    })
    // add new prop to object
    expect(configFile.get('new.deep.newProp')).toEqual(null)
    configFile.set('new.deep.newProp', true)
    expect(configFile.get('new')).toEqual({
      deep: {
        prop: 50,
        newProp: true,
      },
    })

    // write a new array
    expect(configFile.get('new.deep.array')).toEqual(null)
    configFile.set('new.deep.array', [1, 3, 5])
    expect(configFile.get('new.deep.array')).toEqual([1, 3, 5])

    // add item at specific index in array
    expect(configFile.get('new.deep.array.10')).toEqual(null)
    configFile.set('new.deep.array.10', 50)
    expect(configFile.get('new.deep.array')).toEqual([1, 3, 5, null, null, null, null, null, null, null, 50])
  })

  it('appens arrays', function() {
    const configFile = new ConfigFile(configPath)
    configFile.append('array', true)
    expect(configFile.get('array')).toEqual(['1', 2, '5', true])
  })

  it('deletes stuff', function() {
    const configFile = new ConfigFile(configPath)
    configFile.delete('array')
    expect(configFile.get('array')).toEqual(null)
    expect(configFile.get('object.deep.ha')).toEqual(1)
    configFile.delete('object.deep.ha')
    expect(configFile.get('object.deep')).toEqual({
      prop: 'yes',
    })
  })
})
