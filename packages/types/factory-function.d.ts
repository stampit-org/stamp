/**
 * A stamp is a composable factory function that returns object instances based on its descriptor.
 *
 * Creates object instances. Take an options object and return the resulting instance.
 * @link https://github.com/stampit-org/stamp-specification#stamp
 */
type Specification = never;

/**
 * @internal Generic signature for a factory function
 * @template Product The object type that the `Stamp` will create.
 */
export type FactoryFunction<Product = unknown> = (options?: Record<string, unknown>, ...args: unknown[]) => Product;

// TODO normalize helpers

export type IsFactoryFunction<T> = T extends FactoryFunction ? T : never;
export type FactoryFunctionProduct<T> = T extends FactoryFunction ? ReturnType<T> : never;
