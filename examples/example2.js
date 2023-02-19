import Model from '../src/model/model.js';

export default () => {
  /**
   * Example 2: cross-referencing models
   */

  // Define data models

  const Category = new Model({
    // ID: Model.ID,
    'title!': String, // mandatory property
    parent: Model.SAME, // Category model is not defined yet, so we use Model.SAME as a replacement
    exclude: Boolean,
  });

  const Account = new Model({
    // ID: Model.ID,
    title: String,
    balance: Number, // can be either positive or negative
    'limit?': Number, // optional property
  });

  const Transaction = new Model({
    // ID: Model.ID,
    account: Account, // check for Account.ID
    category: Category, // check for Category.ID
    amount: Number,
    date: Date,
    'notes?': String, // optional property
  });

  // Create accounts

  const Checking = new Account({
    title: 'Checking Account',
    balance: 123.56,
  });

  const CreditCard = new Account({
    title: 'Credit Card',
    balance: -876.32,
    limit: 1000,
  });

  try {
    // Attempt to create an invalid instance
    const Invalid = new Account({
      title: '',
      balance: '€200',
    });
  } catch (error) {
    console.log(error.message); // Invalid data
    console.log(error.cause); // { balance: 'must be a number' }
  }

  // Create categories

  const Food = new Category({
    title: 'Food',
  });

  const Dining = new Category({
    title: 'Dining',
    parent: Food,
  });

  const Housing = new Category({
    title: 'Housing',
  });

  try {
    // Attempt to create an invalid instance
    const Untitled = new Category({});
  } catch (error) {
    console.log(error.message); // Invalid data
    console.log(error.cause); // { title: 'required property is not defined' }
  }

  // Create transactions

  const transaction1 = new Transaction({
    account: CreditCard,
    category: Dining,
    amount: 50,
    date: new Date('10/09/2010'),
    notes: 'Green Dragon',
  });

  const transaction2 = new Transaction({
    account: Checking,
    category: Housing,
    amount: 2000,
    date: new Date('10/10/2010'),
    notes: 'Rent',
  });

  try {
    // Attempt to create an invalid instance
    const Invalid = new Transaction({
      account: Food,
      category: 'grocery',
      amount: 123,
    });
  } catch (error) {
    console.log(error.message); // Invalid data
    console.log(error.cause);
    // {
    //   account: 'invalid model type',
    //   category: 'must be a model',
    //   amount: 'required property is not defined',
    //   date: 'required property is not defined'
    // }
  }

  // Use data instances

  const accounts = [Checking, CreditCard];

  console.log(JSON.stringify(accounts, null, '  '));
  // [
  //   {
  //     "title": "Checking Account",
  //     "balance": 123.56,
  //     "limit": null
  //   },
  //   {
  //     "title": "Credit Card",
  //     "balance": -876.32,
  //     "limit": 1000
  //   }
  // ]

  const categories = [Food, Dining, Housing];

  console.log(JSON.stringify(categories[1].parent, null, '  '));
  // {
  //   "parent": null,
  //   "exclude": null,
  //   "title": "Food"
  // }

  const transactions = [transaction1, transaction2];

  console.log(transaction1.date, transaction1.category.title, transaction2.account.title);
  // 2010-10-09T04:00:00.000Z Dining Checking Account

  console.log(transactions[1].account.balance);
  // 123.56
};
