var compose = require('@stamp/compose');
var Shortcut = require('@stamp/shortcut');

function stampit() {
  return compose.apply(this || baseStampit, arguments);
}

const baseStampit = compose(
  Shortcut,
  {
    staticProperties: {
      create: function create() {
        return this.apply(arguments);
      },
      compose: stampit // infecting
    }
  }
);

module.exports = stampit;
