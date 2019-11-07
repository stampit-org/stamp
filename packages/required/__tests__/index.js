/* eslint-disable func-names */

'use strict';

const compose = require('@stamp/compose');
const Required = require('..');

const { required } = Required;

describe('@stamp/required', function() {
  it('should throw if a required method is missing on object creation', function() {
    const Stamp = compose(Required).required({
      methods: {
        requireMe: required,
      },
    });

    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp methods/);
  });

  it('should make sure static method works standalone', function() {
    const Stamp = required({
      methods: {
        requireMe: required,
      },
    });

    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp methods/);
  });

  it('should NOT throw if a required things present on object creation', function() {
    const Stamp = required({
      methods: {
        requireMe: required,
      },
      properties: {
        requireMe: required,
      },
      configuration: {
        requireMe: required,
      },
      staticProperties: {
        requireMe: required,
      },
      propertyDescriptors: NaN,
      staticDeepProperties: undefined,
      staticPropertyDescriptors: null,
      deepConfiguration: {},
    }).compose({
      methods: {
        requireMe() {},
      },
      properties: {
        requireMe: null,
      },
      configuration: {
        requireMe: 0,
      },
      staticProperties: {
        requireMe: NaN,
      },
    });

    expect(function() {
      Stamp();
    }).not.toThrow();
  });

  it('should work for all meta data things', function() {
    let Stamp = required({
      methods: {
        requireMe: required,
      },
    });
    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp methods/);

    Stamp = required({
      properties: {
        requireMe: required,
      },
    });
    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp properties/);

    Stamp = required({
      configuration: {
        requireMe: required,
      },
    });
    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp configuration/);

    Stamp = required({
      staticProperties: {
        requireMe: required,
      },
    });
    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp staticProperties/);
  });

  it('should be composable to any stamp at any palce', function() {
    const Stamp = compose({ properties: { a: 1 } })
      .compose(Required)
      .required({
        methods: {
          requireMe: required,
        },
      });

    expect(function() {
      Stamp();
    }).toThrow(/Required: There must be requireMe in this stamp methods/);
  });
});
