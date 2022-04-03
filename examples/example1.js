import Model from '../src/model.js';

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
