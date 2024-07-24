const mongoose = require('mongoose');

// id is created by mongoose when we save a document
const accessSchema = new mongoose.Schema({
    address: { type: String, required: true },
    type: { type: String, required: true }
});

accessSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// The first argument to the function below dictates the collection to put new documents in.
// This is fragile
const accessModel = mongoose.model('Access', accessSchema);

module.exports = accessModel;