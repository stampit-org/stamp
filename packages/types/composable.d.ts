import type { Descriptor } from './descriptor';
import type { Stamp } from './stamp';

/**
 * A composable is one of:
 *  - A stamp.
 * - A POJO (Plain Old JavaScript Object) stamp descriptor.
 * @link https://github.com/stampit-org/stamp-specification#composable
 */
type dummy = any;

/**
 * A composable object (i.e. a stamp or a descriptor)
 * @typedef {Stamp|Descriptor} Composable
 * @template Instance The object type that the `Stamp` will create.
 * @template FinalStamp The type of the `Stamp` producing the instance.
 * @template Context (optional) The type of the `Stamp` used by the `.composers` functions.
 */
export type Composable<Instance, FinalStamp, Context = FinalStamp> =
  | Stamp<Instance, FinalStamp, Context>
  | Descriptor<Instance, FinalStamp, Context>;
