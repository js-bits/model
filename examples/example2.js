import Model from '../src/model.js';

export const Category = new Model({
  'title!': String, // mandatory property
  parent: Model.SAME, // Category model is not defined yet, so we use Model.SAME as a replacement
  exclude: Boolean,
});

export const Account = new Model({
  title: String,
  balance: Number, // can be either positive or negative
  'limit?': Number, // optional property
});

export const Transaction = new Model({
  account: Account,
  category: Category,
  amount: Number,
  date: Date,
  'notes?': String, // optional property
});
