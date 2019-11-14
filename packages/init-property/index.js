'use strict';

const compose = require('@stamp/compose');
const isStamp = require('@stamp/is/stamp');

const { get, ownKeys, set } = Reflect;

function initializer(opts, ref) {
  const args = ref.args.slice();
  ownKeys(this).forEach((key) => {
    const stamp = get(this, key);
    if (isStamp(stamp)) {
      args[0] = opts && opts[key];
      set(this, key, stamp(...args));
    }
  });
}

const InitProperty = compose({
  initializers: [initializer],
  composers: [
    (opts) => {
      const { initializers } = opts.stamp.compose;
      initializers.splice(initializers.indexOf(initializer), 1);
      initializers.unshift(initializer);
    },
  ],
});

module.exports = InitProperty;
