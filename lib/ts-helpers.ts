/**
 * Helper functions to replace tslib functionality
 */

export function __rest(source: any, exclude: string[]): any {
  const target: any = {}
  for (const prop in source) {
    if (Object.prototype.hasOwnProperty.call(source, prop) && exclude.indexOf(prop) === -1) {
      target[prop] = source[prop]
    }
  }
  return target
}
