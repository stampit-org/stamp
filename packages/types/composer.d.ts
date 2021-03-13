import type { Composable } from './composable';

/**
 * - stamp The result of the composables composition.
 * - composables The list of composables the stamp was just composed of.
 *
 * Note that it's not recommended to return new stamps from a composer. Instead, it's better to mutate the passed stamp.
 * @link https://github.com/stampit-org/stamp-specification#composer-parameters
 */
type dummy = any;

/**
 * A function used as `.composers` argument.
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` produced by the `.compose()` method.
 * @template ComposingStamp (optional) The type of the `Stamp` produced by the `.compose()` method.
 */
export type Composer<Instance, FinalStamp, ComposingStamp = FinalStamp> = (
  this: void,
  parameters: ComposerParameters<Instance, ComposingStamp>
) => void | FinalStamp;

/**
 * The parameters received by the current `.composers` function.
 * @template Instance The object type that the `Stamp` will create.
 * @template ComposingStamp The type of the `Stamp` produced by the `.compose()` method.
 */
export interface ComposerParameters<Instance, ComposingStamp> {
  /** The result of the `Composable`s composition. */
  stamp: ComposingStamp;
  /** The list of composables the `Stamp` was just composed of. */
  composables: Array<Composable<Instance, ComposingStamp>>;
}
