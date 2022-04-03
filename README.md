# Abstract data model

Inspired by [Backbone.js](http://backbonejs.org/#Model). Reimagined and modernized.

`Model` is a dynamic data structure, described by certain rules using a data schema.

```javascript
const Profile = new Model({
  firstName: String,
  lastName: String,
  yearBorn: Number,
  'verified?': Boolean,
});

const author = new Profile({
  firstName: 'Trygve',
  lastName: 'Reenskaug',
  yearBorn: 1930,
});

console.log(`${author}`);
// [object Model]

console.log(author);
// {
//   firstName: 'Trygve',
//   lastName: 'Reenskaug',
//   yearBorn: 1930,
//   verified: null
// }
```

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

## How is this different from [JSON Schema](https://json-schema.org/)?

JSON Schema serves more as a data format description while `Model` is much more functional and gives you more control over data.

[TBD]

## How about immutability?

Well, immutability is not a dogma.

[TBD]

- https://desalasworks.com/article/immutability-in-javascript-a-contrarian-view/
- https://stackoverflow.com/questions/34385243/why-is-immutability-so-important-or-needed-in-javascript/43318963#43318963
- https://medium.com/dailyjs/the-state-of-immutability-169d2cd11310
- https://stackoverflow.com/questions/1863515/pros-cons-of-immutability-vs-mutability

But, anyway, you can still make your data deeply immutable with this package and other benefits (like data validation) at the same time.

```javascript
// Object.freeze({}) vs new Model(immutable)
```
