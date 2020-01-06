// TODO: finer type guard
interface SomeFunction {
  (): unknown;
  compose?: unknown;
}

/**
 * @internal Checks if passed argument is considered a `function`.
 */
export const isFunction = <T extends Function = SomeFunction>(value: unknown): value is T =>
  typeof value === 'function';

export default isFunction;
