/* eslint-disable global-require */
/* eslint-disable jest/expect-expect */
/* eslint-disable jest/no-test-return-statement */
/* eslint-disable node/no-unpublished-require */

'use strict';

const checkCompose = require('@stamp/check-compose');
const { stampit } = require('../');

describe('@stamp/it', function() {
  it('passes official tests', function() {
    const compose = require('..').default;
    return checkCompose(compose).then(function(result) {
      const { failures } = result;
      if (failures && failures.length > 0) {
        const errorString = failures
          .map(function(f) {
            return JSON.stringify(f);
          })
          .join('\n');
        throw new Error(errorString);
      }
    });
  });

  it('has the .create static function', function() {
    const stamp = stampit({
      methods: {
        foo: function foo() {
          return 'foo';
        },
      },
      properties: {
        bar: 'bar',
      },
    });

    expect(stamp.create()).toStrictEqual(stamp());
    expect(stamp.create().foo()).toBe('foo');
  });

  it('converts extended descriptor to a standard', function() {
    const initializer = function() {};
    const composer = function() {};
    const descr = stampit({
      props: { p: 1 },
      init: initializer,
      composers: composer,
      deepProps: { dp: 1 },
      statics: { s: 1 },
      deepStatics: { ds: 1 },
      conf: { c: 1 },
      deepConf: { dc: 1 },
      propertyDescriptors: { pd: { value: 1 } },
      staticPropertyDescriptors: { spd: { value: 1 } },
      name: '1',
    }).compose;

    expect(descr.properties.p).toBe(1);
    expect(descr.initializers).toContain(initializer);
    expect(descr.composers).toContain(composer);
    expect(descr.deepProperties.dp).toBe(1);
    expect(descr.staticProperties.s).toBe(1);
    expect(descr.staticDeepProperties.ds).toBe(1);
    expect(descr.configuration.c).toBe(1);
    expect(descr.deepConfiguration.dc).toBe(1);
    expect(descr.propertyDescriptors.pd.value).toBe(1);
    expect(descr.staticPropertyDescriptors.spd.value).toBe(1);
    expect(descr.staticPropertyDescriptors.name.value).toBe('1');
  });
});
