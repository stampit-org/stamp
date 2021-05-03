# @Stamp Monorepo

_Mono repository for stamp related packages._

Documentation: <https://stampit.js.org>

## Packages

- `@stamp/arg-over-prop` - Assign properties passed to the stamp factory
- `@stamp/check-compose` - Command line tool to test your 'compose' function implementation
- `@stamp/collision` - Detect and manipulate method collisions
- `@stamp/compose` - Compose function implementation to create stamps
- `@stamp/configure` - Access configuration of your stamps anywhere
- `@stamp/core` - Core functions for creating stamps
- `@stamp/eventemittable` - NodeJS' EventEmitter as a stamp
- `@stamp/fp-constructor` - Adds the Functional Programming capabilities to your stamps
- `@stamp/init-property` - Replaces properties which reference stamps with objects created from the stamps
- `@stamp/instanceof` - Enables `obj instanceof MyStamp` in ES6 environments
- `@stamp/is` - Various type checking functions used with stamps
- `@stamp/it` - A nice, handy API implementation of the compose standard
- `@stamp/privatize` - Protect private properties
- `@stamp/required` - Insist on a method/property/staticProperty/configuration presence
- `@stamp/shortcut` - Adds handy static methods for simpler Stamp composition
- `@stamp/types` - Typescript definition of the Stamp specification

### Deprecated

- `@stamp/named` - (Re)Name a stamp factory function

## Changelog

- **v0.x.x** were development versions.
- **v1.x.x** are production ready versions. No API changes comparing to v0.x.x.

## Development

## Install

Run `npm install` as usual followed by `npm run bootstrap` which creates local references to modules that require each other.

## Tests

The `npm test` will execute [Jest](https://jestjs.io/) tests, and then [ESLint](https://eslint.org/).

The `npm test -- --watch` will watch file changes and execute tests as needed.
