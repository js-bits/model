import Model from '../src/model.js';

const example1 = () => {
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
};

example1();
