var compose = require('@stamp/compose');

var Named = compose({
  staticProperties: {
    setName: function (name) {
      'use strict';
      var Stamp = this && this.compose ? this : Named;
      return Stamp.compose({
        staticPropertyDescriptors: {
          name: {
            value: name
          }
        }
      });
    }
  }
});

module.exports = Named;
