/**
 * @internal Generic signature for a method
 * @template Bound The object type bound to the method.
 */
type AnyMethod<Bound> = (this: void | Bound, ...args: any[]) => any;

/**
 * An object containing a set of methods and properties
 * @template Bound The object type bound to the methods.
 */
export type MethodMap<Bound> = Record<string, AnyMethod<Bound> | unknown>;

/**
 * An object containing a set of properties
 */
export type PropertyMap = Record<string, unknown>;
