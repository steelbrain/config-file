/* @flow */

export function split(path: string): Array<string> {
  return path.split('.').filter(i => i)
}

export function getKeys(path: string): { childKey: string, parentKey: string } {
  const chunks = split(path)
  const childKey = chunks.pop()
  const parentKey = chunks.join('.')
  return { childKey, parentKey }
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
    current = {}
    // eslint-disable-next-line no-param-reassign
    object[chunks[position]] = current
  }
  if (typeof current !== 'object' || !current) {
    if (strict) {
      const error = new Error(`Invalid access of '${chunks.join('.')}' when '${chunks.slice(0, position).join('.')}' is ${typeof current}`)
      // $FlowIgnore: Custom prop
      error.code = 'CONFIG_INVALID_ACCESS'
      throw error
    } else {
      current = {}
      // eslint-disable-next-line no-param-reassign
      object[chunks[position]] = current
    }
  }
  if (chunks.length === position + 1) {
    return current
  }
  return deepNormalize(current, chunks, strict, position + 1)
}
