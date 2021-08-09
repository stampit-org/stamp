import type { ComposeFunction } from './compose-function';
import type { Descriptor } from './descriptor';

/**
 * Stamps have a method called `.compose()`
 *
 * When called the `.compose()` method creates new stamp using the current stamp as a base, composed with a list of composables passed as arguments:
 *
 * The `.compose()` method doubles as the stamp's descriptor. In other words, descriptor properties are attached to the stamp `.compose()` method, e.g. stamp.compose.methods.
 *
 * A method exposed by all stamps, identical to compose(), except it prepends this to the stamp parameters. Stamp descriptor properties are attached to the .compose method, e.g. stamp.compose.methods.
 * @link https://github.com/stampit-org/stamp-specification#stamp
 */
type Specification = never;

// TODO ComposeProperty should not require generic

/**
 * TODO
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 * @template ComposingStamp (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export interface ComposeProperty<Instance, FinalStamp, ComposingStamp = FinalStamp>
  extends ComposeFunction<Instance, FinalStamp, ComposingStamp>,
    Descriptor<Instance, FinalStamp, ComposingStamp> {}
