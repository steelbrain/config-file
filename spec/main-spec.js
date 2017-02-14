/* @flow */

import FS from 'sb-fs'
import Path from 'path'
import copy from 'sb-copy'
import { fit, it, beforeEach, afterEach } from 'jasmine-fix'

import ConfigFile from '../src'

describe('ConfigFile', function() {
  const fixtures = Path.join(__dirname, 'fixtures')
  const directory = Path.join(fixtures, 'ignored')
  const nonExistent = Path.join(directory, 'file-1')
  const tempPath = Path.join(directory, 'temp-1')
  const configPath = Path.join(directory, 'config.json')

  beforeEach(async function() {
    await FS.mkdirp(Path.join(fixtures, 'ignored'))
    await copy(Path.join(fixtures, 'files'), Path.join(fixtures, 'ignored'))
  })
  afterEach(async function() {
    await FS.rimraf(Path.join(fixtures, 'ignored'))
  })

  function getConfigFile(...args: Array<any>) {
    return ConfigFile.get(...args)
  }
  //
  it('creates empty if file is non existent', async function() {
    expect(await FS.exists(nonExistent)).toBe(false)
    await getConfigFile(nonExistent, null, { createIfNonExistent: true })
    expect(await FS.readFile(nonExistent, 'utf8')).toBe('{}\n')
  })

  describe('Sync APIs', function() {
    it('returns full object if get is empty', async function() {
      const configFile = await getConfigFile(configPath)
      expect(configFile.getSync()).toEqual({
        array: ['1', 2, '5'],
        object: {
          deep: {
            prop: 'yes',
            ha: 1,
          },
        },
      })
    })
    it('returns deep stuff', async function() {
      const configFile = await getConfigFile(configPath)
      expect(configFile.getSync('array')).toEqual(['1', 2, '5'])
      expect(configFile.getSync('array.1')).toEqual(2)
      expect(configFile.getSync('object.deep.prop')).toEqual('yes')
      expect(configFile.getSync('object.deep.ha')).toEqual(1)
    })

    it('writes deep stuff', async function() {
      const configFile = await getConfigFile(configPath)

      // write a new object
      expect(configFile.getSync('new.deep.prop')).toEqual(null)
      configFile.setSync('new.deep.prop', 50)
      expect(configFile.getSync('new')).toEqual({
        deep: {
          prop: 50,
        },
      })
      // add new prop to object
      expect(configFile.getSync('new.deep.newProp')).toEqual(null)
      configFile.setSync('new.deep.newProp', true)
      expect(configFile.getSync('new')).toEqual({
        deep: {
          prop: 50,
          newProp: true,
        },
      })

      // write a new array
      expect(configFile.getSync('new.deep.array')).toEqual(null)
      configFile.setSync('new.deep.array', [1, 3, 5])
      expect(configFile.getSync('new.deep.array')).toEqual([1, 3, 5])

      // add item at specific index in array
      expect(configFile.getSync('new.deep.array.10')).toEqual(null)
      configFile.setSync('new.deep.array.10', 50)
      expect(configFile.getSync('new.deep.array')).toEqual([1, 3, 5, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 50])
    })

    it('appens arrays', async function() {
      const configFile = await getConfigFile(configPath)
      configFile.appendSync('array', true)
      expect(configFile.getSync('array')).toEqual(['1', 2, '5', true])
    })

    it('deletes stuff', async function() {
      const configFile = await getConfigFile(configPath)
      configFile.deleteSync('array')
      expect(configFile.getSync('array')).toEqual(null)
      expect(configFile.getSync('object.deep.ha')).toEqual(1)
      configFile.deleteSync('object.deep.ha')
      expect(configFile.getSync('object.deep')).toEqual({
        prop: 'yes',
      })
    })

    it('pretty prints by default', async function() {
      await getConfigFile(tempPath, { some: 'thing' }, { createIfNonExistent: true })
      expect(await FS.readFile(tempPath, 'utf8')).toBe('{\n  "some": "thing"\n}\n')
    })
    it('can disable pretty printing if we tell it to', async function() {
      await getConfigFile(tempPath, { some: 'thing' }, {
        prettyPrint: false,
        createIfNonExistent: true,
      })
      expect(await FS.readFile(tempPath, 'utf8')).toBe('{"some":"thing"}\n')
    })
  })
  describe('Async APIs', function() {
    it('returns full object if get is empty', async function() {
      const configFile = await getConfigFile(configPath)
      expect(await configFile.get()).toEqual({
        array: ['1', 2, '5'],
        object: {
          deep: {
            prop: 'yes',
            ha: 1,
          },
        },
      })
    })
    it('returns deep stuff', async function() {
      const configFile = await getConfigFile(configPath)
      expect(await configFile.get('array')).toEqual(['1', 2, '5'])
      expect(await configFile.get('array.1')).toEqual(2)
      expect(await configFile.get('object.deep.prop')).toEqual('yes')
      expect(await configFile.get('object.deep.ha')).toEqual(1)
    })

    it('writes deep stuff', async function() {
      const configFile = await getConfigFile(configPath)

      // write a new object
      expect(await configFile.get('new.deep.prop')).toEqual(null)
      await configFile.set('new.deep.prop', 50)
      expect(await configFile.get('new')).toEqual({
        deep: {
          prop: 50,
        },
      })
      // add new prop to object
      expect(await configFile.get('new.deep.newProp')).toEqual(null)
      await configFile.set('new.deep.newProp', true)
      expect(await configFile.get('new')).toEqual({
        deep: {
          prop: 50,
          newProp: true,
        },
      })

      // write a new array
      expect(await configFile.get('new.deep.array')).toEqual(null)
      await configFile.set('new.deep.array', [1, 3, 5])
      expect(await configFile.get('new.deep.array')).toEqual([1, 3, 5])

      // add item at specific index in array
      expect(await configFile.get('new.deep.array.10')).toEqual(null)
      await configFile.set('new.deep.array.10', 50)
      expect(await configFile.get('new.deep.array')).toEqual([1, 3, 5, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 50])
    })

    it('appens arrays', async function() {
      const configFile = await getConfigFile(configPath)
      await configFile.append('array', true)
      expect(await configFile.get('array')).toEqual(['1', 2, '5', true])
    })

    it('deletes stuff', async function() {
      const configFile = await getConfigFile(configPath)
      await configFile.delete('array')
      expect(await configFile.get('array')).toEqual(null)
      expect(await configFile.get('object.deep.ha')).toEqual(1)
      await configFile.delete('object.deep.ha')
      expect(await configFile.get('object.deep')).toEqual({
        prop: 'yes',
      })
    })

    it('pretty prints by default', async function() {
      await getConfigFile(tempPath, { some: 'thing' }, { createIfNonExistent: true })
      expect(await FS.readFile(tempPath, 'utf8')).toBe('{\n  "some": "thing"\n}\n')
    })
    it('can disable pretty printing if we tell it to', async function() {
      await getConfigFile(tempPath, { some: 'thing' }, {
        prettyPrint: false,
        createIfNonExistent: true,
      })
      expect(await FS.readFile(tempPath, 'utf8')).toBe('{"some":"thing"}\n')
    })
  })
})
