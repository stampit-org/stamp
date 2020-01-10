// TODO: finer type guard
interface FunctionMaybeAStamp {
  (): unknown;
  compose?: unknown;
}

/**
 * @internal Checks if passed argument is considered a `function`.
 */
const isFunction = <T extends Function = FunctionMaybeAStamp>(value: unknown): value is T =>
  typeof value === 'function';

export default isFunction;

// For CommonJS default export support
module.exports = isFunction;
Object.defineProperty(module.exports, 'default', { enumerable: false, value: isFunction });
