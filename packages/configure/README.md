# @stamp/configure

_Access configuration of your stamps anywhere_

Configuration is powerful feature of stamps as it allows you to store additional information with the stamp without interfering with properties or methods. Consider following example.

## Usage

```js
import compose from '@stamp/compose'
import jwt from 'jsonwebtoken'

const Jwt = compose({
  configuration: {
    jwtSecret: process.env.SECRET,
  },
  initializers: [
    initializeJwt(_, { stamp }) {
      const { jwtSecret } = stamp.compose.configuration
      ...
      this.createJwtToken = (payload) => jwt.sign(payload, jwtSecret)
      this.verifyJwtToken = (token) => jwt.verify(token, jwtSecret)
    }
  ]
})
```

That approach brings several advantages.

 * Clearly specify what makes the stamp tick.
 * Configured values are immutable.
 * Stamp with a modified configuration can be made.

The last bullet is especially useful for automated testing allowing you to insert different values based on various conditions. Unfortunately, there is apparent boilerplate hidden behind this, and it can get tedious for a larger project.

Now consider next example that is using `@stamp/configure` stamp.

```js
import Configure from '@stamp/configure'
import jwt from 'jsonwebtoken'

const Jwt = Configure.compose({
  configuration: {
    jwtSecret: process.env.SECRET,
  },
  methods: {
    createJwtToken(payload) {
      return jwt.sign(payload, this.config.jwtSecret)
    },
    verifyJwtToken(token) {
      return jwt.verify(token, this.config.jwtSecret)
    }
  }
})
```

Looks good, doesn't it? But wait, all those advantages of the configuration are suddenly gone, right? Not exactly.

Under the hood, we are using `@stamp/privatize` stamp. That allows us to access `this.config` within our methods and yet keep them hidden from outside world. Immutability is ensured by using `Object.freeze()`.

The `deepConfiguration` gets assigned to the same `this.config` object as well while it has a precedence over the `configuration`. In case of name conflict, the value from `deepConfiguration` always wins.

### No fan of @stamp/privatize ?

By including `@stamp/configure` your whole stamp is privatized by default which you may not like that much. For that case, we are offering opt-out option of using `Configure.noPrivatize()` instead of plain `Configure`.
