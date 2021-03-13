import type { PropertyMap } from './maps';

/**
 * - options The options argument passed into the stamp, containing properties that may be used by initializers.
 *   - instance The object instance being produced by the stamp. If the initializer returns a value other than undefined, it replaces the instance.
 *   - stamp A reference to the stamp producing the instance.
 *   - args An array of the arguments passed into the stamp, including the options argument.
 *
 * Note that if no options object is passed to the factory function, an empty object will be passed to initializers.
 * @link https://github.com/stampit-org/stamp-specification#initializer-parameters
 */
type dummy = any;

/**
 * A function used as `.initializers` argument.
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 */
export type Initializer<Instance, FinalStamp> = (
  this: Instance,
  options: PropertyMap,
  context: InitializerContext<Instance, FinalStamp>
) => Instance | void;

/**
 * The `Initializer` function context.
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 */
export interface InitializerContext<Instance, FinalStamp> {
  /** The object instance being produced by the `Stamp`. If the initializer returns a value other than `undefined`, it replaces the instance. */
  instance: Instance;
  /** A reference to the `Stamp` producing the instance. */
  stamp: FinalStamp;
  /** An array of the arguments passed into the `Stamp`, including the options argument. */
  args: unknown[];
}
