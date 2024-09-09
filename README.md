# [WORK IN PROGRESS] Multi-purpose data model

Inspired by [Backbone.Model](http://backbonejs.org/#Model). Re-imagined and modernized.

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

Key features:

- Strict data schema
- Runtime data validation
- Configurable data types
- Optional deep objects immutability
- Interactive data store
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

More examples can be found in [examples](https://github.com/js-bits/model/tree/main/examples) folder.

## How is this different from [JSON Schema](https://json-schema.org/)?

JSON Schema serves more as a data format description, while `Model` is much more functional and gives you more control over data.

[TBD]

## Ok. But what about TypeScript?

Code written in TypeScript is only checked for errors before it is executed, during compile time. Moreover, not every project is built with TypeScript. And not every project needs TypeScript.

[TypeScript is ‘not worth it’ for developing libraries, says Svelte author, as team switches to JavaScript and JSDoc](https://devclass.com/2023/05/11/typescript-is-not-worth-it-for-developing-libraries-says-svelte-author-as-team-switches-to-javascript-and-jsdoc/)

[TBD]

As for IDE's code-completion capabilities, you can achieve similar result with [JSDoc](https://jsdoc.app/) annotations.

## Hmm... But we already have [Zod](https://zod.dev/)

Sure. `Model` does something similar to what [Zod](https://zod.dev/) does,
but while [Zod](https://zod.dev/) is "a schema declaration and validation library",
`Model` goes further and is aimed to serve more like a data store.
Also, `Model` has more natural syntax.

[TBD]

## GraphQL?

GraphQL queries tend to grow over time and you have to carry unnecessary data even though you don't use it.
`Model` allows you to control what data exactly you need to operate.

[TBD]

## How about immutability, then?

Well, immutability is not a dogma.

[TBD]

- https://desalasworks.com/article/immutability-in-javascript-a-contrarian-view/
- https://stackoverflow.com/questions/34385243/why-is-immutability-so-important-or-needed-in-javascript/43318963#43318963
- https://medium.com/dailyjs/the-state-of-immutability-169d2cd11310
- https://stackoverflow.com/questions/1863515/pros-cons-of-immutability-vs-mutability

But, anyway, you can make your data deeply immutable with this package and still use other benefits (like data validation) at the same time.

```javascript
Object.freeze(object); // shallow freeze
// versus
new CustomModel(object); // deep freeze
```
