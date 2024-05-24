const mongoose = require('mongoose');

// id is created by mongoose when we save a document
const addressSchema = new mongoose.Schema({
    address: { type: String, required: true}
});

addressSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// The first argument to the function below dictates the collection to put new documents in.
// This is fragile
const addressModel = mongoose.model('Address', addressSchema);

module.exports = addressModel;