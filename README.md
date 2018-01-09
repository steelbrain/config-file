sb-config-file
=========

[![Greenkeeper badge](https://badges.greenkeeper.io/steelbrain/config-file.svg)](https://greenkeeper.io/)

sb-config-file is a Node.js module to help you manage your JSON configuration files without worrying about concurrency issues or double writes. It uses and therefore supports the [`lodash.get/lodash.set`](https://lodash.com/docs/4.17.4#get) way of accessing properties

## API

```js
type Options = {
  prettyPrint: boolean = true,
  atomicWrites: boolean = true,
}

export default class ConfigFile {
  get(dotSeparatedKey: string, defaultValue = null): Promise<any>
  getSync(dotSeparatedKey: string, defaultValue = null): any
  set(dotSeparatedKey: string, value, strict = false): Promise<void>
  setSync(dotSeparatedKey: string, value, strict = false): void
  delete(dotSeparatedKey: string, strict = false): Promise<void>
  deleteSync(dotSeparatedKey: string, strict = false): void

  static get(filePath: string, defaultConfig: Object, options: Options): ConfigFile
}}
```

## Example Usage

```js
const Path = require('path')
const ConfigFile = require('sb-config-file')

ConfigFile.get(Path.join(__dirname, 'config.json')).then(function(configFile) {
  configFile.set('database.host', 'localhost')
  configFile.set('database.user', 'steelbrain')

  console.log(configFile.get('database.host')) // 'localhost'
  console.log(configFile.get('database.user')) // 'steelbrain'
  console.log(configFile.get('database'))      // { host: 'localhost', user: 'steelbrain' }

  configFile.delete('database.host')
  console.log(configFile.get('database'))      // { user: 'steelbrain' }

  configFile.set('someArray', [1, 2, 3])
  configFile.set('someArray.5', 50)
  console.log(configFile.get('someArray.0')) // 1
  console.log(configFile.get('someArray.1')) // 2
  console.log(configFile.get('someArray.2')) // 3
  console.log(configFile.get('someArray.3')) // undefined
  console.log(configFile.get('someArray.4')) // undefined
  console.log(configFile.get('someArray.5')) // 50
})
```

## LICENSE

This package is licensed under the terms of MIT License. See the LICENSE file for more info.
