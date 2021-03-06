### 4.0.0

- Remove `append` and `appendSync`
- Remove `createIfNonExistent` (we now NEVER crash on read if the file does not exist)
- Rewrote to only re-read the file when it changes on file-system (by using FS watching)

### 3.0.3

- Upgrade sb-fs to v3 to remove a lot of unwanted deps, making the package more lightweight

### 3.0.2

- Fix a bug where reading would throw if a file did not exist and `createIfNonExistent` was set to false

### 3.0.1

- Fix some critical typos

### 3.0.0

- Make functions async by default and add their sync eqv

### 2.0.0

- API Breaking: Remove supports for JSON comments during parse because it's known to break some really big JSON files

### 1.2.1

- Fix an unknown deployment issue

### 1.2.0

- Add `noPrettyPrint` option

### 1.1.0

- Add `.delete()` method
- Write default config on non existent instead of empty

### 1.0.0
 - Initial release
