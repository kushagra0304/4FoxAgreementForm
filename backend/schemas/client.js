const mongoose = require('mongoose');

// id is created by mongoose when we save a document
const clientSchema = new mongoose.Schema({
    emailId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true }],
});

clientSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// The first argument to the function below dictates the collection to put new documents in.
// This is fragile
const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;