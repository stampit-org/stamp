# @stamp/init-property

_Replaces properties which reference stamps with objects created from the stamps_

If your StampA would have, say, property `foo` which references a StampB, then the property will be replaced with the StampB instance. The parameter for the `StampB(arg)` will be taken form the `foo` property of the StampA argument.

You might find it useful for better Dependency Injection pattern. 

## Usage

```js
const StampA = compose({
    properties: {
        foo: StampB
    }
})
.compose(InitProperty);

// StampB will receive initializer argument `{bar: 'baz'}`
StampA({foo: {bar: 'baz'}});
```


## Example

```js
import InitProperty from '@stamp/init-property';

import Oauth2 from './stamps/oauth2';

const GravatarClient = compose(InitProperty, {
  properties: {
    auth: Oauth2 // the 'auth' property is expected to be passed to the stamp
  },
  methods: {
    getProfilePicture() {
      return fetch('gravatar.com', {
        headers: {
          Authorization: this.auth.getHttpHeader() // accessing this.auth
        }
      });
    }
  }
});

const gravatarClient = GravatarClient({
  auth: { // Passing the data for the 'Oauth2' stamp
    client_id: '1', client_secret: '2', grant_type: 'simple'
  }
});
gravatarClient.getProfilePicture().then(stream => fs.writeFileSync(stream));
```
