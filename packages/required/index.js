var compose = require('@stamp/compose');
var assign = require('@stamp/core/assign');
var isObject = require('@stamp/is/object');

function required(settings) {
  'use strict';
  var Stamp = this && this.compose ? this : Required; // jshint ignore:line
  var prevSettings = Stamp.compose.deepConfiguration && Stamp.compose.deepConfiguration.Required;

  // filter out non stamp things
  var newSettings = assign({}, compose(prevSettings, settings).compose);

  return Stamp.compose({deepConfiguration: {Required: newSettings}});
}

function checkDescriptorHaveThese(descriptor, settings) {
  if (!descriptor || !settings) return;
  // Traverse settings and find if there is anything required.
  var settingsKeys = Object.keys(settings);
  for (var i = 0; i < settingsKeys.length; i++) {
    var settingsKey = settingsKeys[i];
    var settingsValue = settings[settingsKey];
    if (isObject(settingsValue)) {
      var metadataKeys = Object.keys(settingsValue);
      for (var j = 0; j < metadataKeys.length; j++) {
        var metadataKey = metadataKeys[j];
        var metadataValue = settingsValue[metadataKey];
        if (metadataValue === Required || metadataValue === required) {
          // We found one thing which have to be provided. Let's check if it exists.
          if (!descriptor[settingsKey] || descriptor[settingsKey][metadataKey] === undefined) {
            throw new Error('Required: There must be ' + metadataKey + ' in this stamp ' + settingsKey);
          }
        }
      }
    }
  }
}

var Required = compose({
  initializers: [function (_, opts) {
    var descriptor = opts.stamp.compose;
    var settings = descriptor.deepConfiguration && descriptor.deepConfiguration.Required;
    checkDescriptorHaveThese(descriptor, settings);
  }],
  staticProperties: {
    required: required
  }
});

Object.freeze(required);
Object.freeze(Required);

module.exports = Required;
