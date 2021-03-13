import type { FactoryFunction } from './factory-function';
import type { HasComposeProperty } from './compose-property';

/**
 * A stamp is a composable factory function that returns object instances based on its descriptor.
 * @link https://github.com/stampit-org/stamp-specification#stamp
 */
type dummy = any;

/**
 * The Stamp factory function
 *
 * A factory function to create plain object instances.
 * It also has a `.compose()` method which is a copy of the `ComposeMethod` function and a `.compose` accessor to its `Descriptor`.
 * @typedef {Function} Stamp
 * @returns {*} Instantiated object
 * @property {Descriptor} compose - The Stamp descriptor and composition function
 * @template Instance The object type that the `Stamp` will create.
 * @template Stamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export interface Stamp<Instance, Stamp, Context = Stamp>
  extends FactoryFunction<Instance>,
    HasComposeProperty<Instance, Stamp, Context> {}
