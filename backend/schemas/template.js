const mongoose = require('mongoose');

// id is created by mongoose when we save a document
const templateSchema = new mongoose.Schema({
    template: { type: Buffer, required: true },
    type: { type: String, required: true }
});

templateSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// The first argument to the function below dictates the collection to put new documents in.
// This is fragile
const templateModel = mongoose.model('Template', templateSchema);

module.exports = templateModel;