/**
 * @internal Utility function signature which allows a `compose` property to exist.
 */
// TODO: finer type guard
interface FunctionMaybeAStamp {
  compose?: unknown;
  (): unknown;
}

/**
 * @internal Checks if passed argument is considered a `function`.
 */
const isFunction = <T extends (...arg: any) => any = FunctionMaybeAStamp>(value: unknown): value is T =>
  typeof value === 'function';

// For CommonJS default export support
export default isFunction;

// For CommonJS default export support
module.exports = isFunction;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isFunction });
