/**
 * @internal Utility function signature which allows a `compose` property to exist.
 */
// ! weak types
// try extends ComposeAttribute
interface FunctionMaybeAStamp {
  compose?: unknown;
  (...args: unknown[]): unknown;
}

/**
 * @internal Checks if passed argument is considered a `function`.
 */
// ! weak types
const isFunction = <T extends (...args: any) => unknown = FunctionMaybeAStamp>(value: unknown): value is T =>
  typeof value === 'function';

// For CommonJS default export support
export default isFunction;

// For CommonJS default export support
module.exports = isFunction;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isFunction });
