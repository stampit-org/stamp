var compose = require('@stamp/compose');
var isStamp = require('@stamp/is/stamp');

function initializer(opts, ref) {
  var args = ref.args.slice();
  var keys = Object.keys(this);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i], stamp = this[key];
    if (isStamp(stamp)) {
      args[0] = opts && opts[key];
      this[key] = stamp.apply(undefined, args);
    }
  }
}

module.exports = compose({
  initializers: [initializer],
  composers: [function (opts) {
    var initializers = opts.stamp.compose.initializers;
    initializers.splice(initializers.indexOf(initializer), 1);
    initializers.unshift(initializer);
  }]
});
