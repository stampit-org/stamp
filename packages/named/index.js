var compose = require('@stamp/compose');

module.exports = compose({
  staticProperties: {
    setName: function (name) {
      return this.compose({
        staticPropertyDescriptors: {
          name: {
            value: name
          }
        }
      });
    }
  }
});
