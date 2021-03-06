import SimpleSchema from "simpl-schema";

const FacebookAccounts = new Mongo.Collection("facebook_accounts");

FacebookAccounts.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: true,
    unique: true
  },
  name: {
    type: String
  },
  category: {
    type: String
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  }
});

FacebookAccounts.attachSchema(FacebookAccounts.schema);

exports.FacebookAccounts = FacebookAccounts;
