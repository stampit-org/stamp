# check-compose
Command line tool to test your ['compose' function implementation](https://github.com/stampit-org/stamp-specification)

## Install

```sh
$ npm i -g @stamp/check-compose
```

## Usage

### Command line

```sh
$ check-compose path/to/compose.js
```

### Programmatically

```js
import checkCompose from 'check-compose';
checkCompose(myComposeFunction).then(({failures}) => {
  console.error(failures.join('\n'));
});
```
