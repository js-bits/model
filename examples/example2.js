import Model from '../src/model.js';

const Category = new Model({
  'title!': String, // mandatory property
  parent: Model.SAME, // Category model is not defined yet, so we use Model.SAME as a replacement
  exclude: Boolean,
});

const Account = new Model({
  title: String,
  balance: Number, // can be either positive or negative
  'limit?': Number, // optional property
});

const Transaction = new Model({
  amount: Number,
  date: Date,
  'notes?': String, // optional property
});

const account1 = new Account({
  title: 'Checking Account',
  balance: 123.56,
});

const account2 = new Account({
  title: 'Credit Card',
  balance: -876.32,
  limit: 1000,
});

const category1 = new Category({
  title: 'Dining',
});

const category2 = new Category({
  title: 'Housing',
});
