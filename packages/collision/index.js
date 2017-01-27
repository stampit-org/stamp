var compose = require('@stamp/compose');
var isStamp = require('@stamp/is/stamp');
var isObject = require('@stamp/is/object');

module.exports = compose({
  deepConfiguration: {Privatize: {methods: []}},
  staticProperties: {
    methodCollisions: function () {
      return this.compose({
        deepConfiguration: {
          Collision: {}
        }
      });
    }
  },
  composers: [function (opts) {
    var methods = opts.stamp.compose.methods;
    var composables = opts.composables;
    var methodsMetadata = {};
    for (var i = 0; i < composables.length; i++) {
      var c = composables;
      c = isStamp(c) ? c.compose : c;
      if (isObject(c.methods)) {
        var methodNames = Object.keys(c.methods);
        for (var j = 0; j < methodNames.length; j++) {
          var name = methodNames[j];


        }
      }
    }

  }]
});
