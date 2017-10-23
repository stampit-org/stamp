# @stamp/required

_Insist on a method/property/staticProperty/configuration presence_

This stamp (aka behavior) will throw if a method (property, staticProperty, configuration, etc) is missing at object creation. 

## Usage

```js
import Required from '@stamp/required'

const InsistOnRedrawMethod = Required.required({methods: {redraw: Required}})
```

Or if you don't want to import the stamp you can import only the method:
```js
import {required} from '@stamp/required'
const InsistOnRedrawMethod = required({methods: {redraw: required}})
```

## API

### Static methods

#### required
Setup which things are required 
`stamp.required({METATYPE: {KEY: required}}) -> Stamp`


## Example

```js
import stampit from '@stamp/it'
import Required, {required} from '@stamp/required'

const requiredConfigurationDifficulty = required({configuration: {difficulty: required}})
const requiredMethodMove = required({methods: {move: Required}})
const requiredPropertyGuild = Required.required({properties: {guild: required}})

let Paladin = stampit({
  props: {
    mana: 50,
    strength: 50,
    health: 100
  }
})

const paladin = Paladin() // ok

Paladin = Paladin.compose(
  requiredConfigurationDifficulty, 
  requiredMethodMove, 
  requiredPropertyGuild
)

const paladin = Paladin() // THROWS - Required: There must be difficulty in this stamp configuration

Paladin = Paladin.conf({ difficulty: 5 })

const paladin = Paladin() // THROWS - Required: There must be move in this stamp methods

Paladin = Paladin.methods({
  move(x, y) {
    // ... implementation
  }
})

const paladin = Paladin() // THROWS - Required: There must be guild in this stamp properties

Paladin = Paladin.props({ guild: 'Warriors of Light' })

const paladin = Paladin() // ok
```
