# Multi-purpose data model

Inspired by [Backbone.js](http://backbonejs.org/#Model). Reimagined and modernized.

`Model` is a static data structure, defined by certain rules using a data schema.

```javascript
const Profile = new Model({
  firstName: String,
  lastName: String,
  yearBorn: Number,
  'verified?': Boolean, // optional property
});

const author = new Profile({
  firstName: 'Trygve',
  lastName: 'Reenskaug',
  yearBorn: 1930,
});

console.log(`${author}`);
// [object Model]

console.log(JSON.stringify(author, null, '  '));
// {
//   firstName: 'Trygve',
//   lastName: 'Reenskaug',
//   yearBorn: 1930,
//   verified: null
// }
```

Features:

- Strict data schema
- Runtime data validation
- ...

[TBD]

## Installation

Install with npm:

```
npm install @js-bits/model
```

Install with yarn:

```
yarn add @js-bits/model
```

Import where you need it:

```javascript
import { Model, DataType } from '@js-bits/model';
```

or require for CommonJS:

```javascript
const { Model, DataType } = require('@js-bits/model');
```

## How to use

[TBD]

More examples can be found in [examples](https://github.com/js-bits/model/tree/main/examples) folder

## How is this different from [JSON Schema](https://json-schema.org/)?

JSON Schema serves more as a data format description, while `Model` is much more functional and gives you more control over data.

[TBD]

## Ok. But, what about TypeScript?

Not every project is built with TypeScript. And not every project needs TypeScript.

[TBD]

You can also use [JSDoc](https://jsdoc.app/) to achieve similar result.

## How about immutability, then?

Well, immutability is not a dogma.

[TBD]

- https://desalasworks.com/article/immutability-in-javascript-a-contrarian-view/
- https://stackoverflow.com/questions/34385243/why-is-immutability-so-important-or-needed-in-javascript/43318963#43318963
- https://medium.com/dailyjs/the-state-of-immutability-169d2cd11310
- https://stackoverflow.com/questions/1863515/pros-cons-of-immutability-vs-mutability

But, anyway, you can make your data deeply immutable with this package and still use other benefits (like data validation) at the same time.

```javascript
// Object.freeze({}) vs new Model(immutable)
// shallow freeze vs deep freeze
```
