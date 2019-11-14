'use strict';

const compose = require('@stamp/compose');

/**
 * @deprecated REASON
 */
const Named = compose({
  staticProperties: {
    setName(name) {
      const Stamp = this && this.compose ? this : Named;
      return Stamp.compose({
        staticPropertyDescriptors: {
          name: { value: name },
        },
      });
    },
  },
});

module.exports = Named;
