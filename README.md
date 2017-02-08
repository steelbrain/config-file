sb-config-file
=========

sb-config-file is a Node.js module to help you manage your JSON configuration files without worrying about concurrency issues and double writes

## API

```js
type Options = {
  failIfNonExistent: boolean = false
}

export default class ConfigFile {
  constructor(filePath: string, defaultConfig: Object, options: Options)
  get(dotSeparatedKey: string, defaultValue = null, strict = false)
  set(dotSeparatedKey: string, value, strict = false)
  append(dotSeparatedKey: string, value, strict = false)
  delete(dotSeparatedKey: string, strict = false)
}}
```

## Example Usage

```js
const Path = require('path')
const ConfigFile = require('sb-config-file')
const configFile = new ConfigFile(Path.join(__dirname, 'config.json'))

configFile.set('database.host', 'localhost')
configFile.set('database.user', 'steelbrain')

console.log(configFile.get('database.host')) // 'localhost'
console.log(configFile.get('database.user')) // 'steelbrain'
console.log(configFile.get('database'))      // { host: 'localhost', user: 'steelbrain' }

configFile.delete('database.host')
console.log(configFile.get('database'))      // { user: 'steelbrain' }

configFile.set('someArray', [1, 2, 3])
console.log(configFile.get('someArray.0')) // 1
console.log(configFile.get('someArray.1')) // 2
console.log(configFile.get('someArray.2')) // 3

configFile.set('someArray.5', 50)
console.log(configFile.get('someArray.0')) // 1
console.log(configFile.get('someArray.1')) // 2
console.log(configFile.get('someArray.2')) // 3
console.log(configFile.get('someArray.3')) // null
console.log(configFile.get('someArray.4')) // null
console.log(configFile.get('someArray.5')) // 50

configFile.set('newArray', [1, 2, 3])
console.log(configFile.get('newArray')) // [1, 2, 3]
configFile.append('newArray', 20)
console.log(configFile.get('newArray')) // [1, 2, 3, 20]
```

## LICENSE

This package is licensed under the terms of MIT License. See the LICENSE file for more info.
