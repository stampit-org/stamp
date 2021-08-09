import type { LastArrayElement } from 'type-fest';

import type { Composable } from './composable';

/**
 * Standalone compose() pure function (optional)
 *
 * Creates stamps. Take any number of stamps or descriptors. Return a new stamp that encapsulates combined behavior. If nothing is passed in, it returns an empty stamp.
 *
 * The .compose() method of any stamp can be detached and used as a standalone compose() pure function.
 * @link https://github.com/stampit-org/stamp-specification#descriptor
 */
type Specification = never;

// TODO ComposeFunction should not require generic
// TODO ComposeFunction should infer *FinalStamp* as follow:
// 1. Optional generic if it extends *Stamp*
// 2. extract the *Stamp* type from last *Composable* `args` arguments if possible
// 3. Fall back to a generic *Stamp* signature

/**
 * Given the list of composables (stamp descriptors and stamps) returns a new stamp (composable factory function).
 * @typedef {Function} Compose
 * @param {...(Composable)} [arguments] The list of composables.
 * @returns {Stamp} A new stamp (aka composable factory function)
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 * @template ComposingStamp (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export type ComposeFunction<Instance, FinalStamp, ComposingStamp = FinalStamp> = (
  this: void | ComposingStamp,
  ...args: Array<Composable<Instance, FinalStamp, ComposingStamp> | undefined>
) => LastArrayElement<typeof args>;
