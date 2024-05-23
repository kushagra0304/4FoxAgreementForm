const mongoose = require('mongoose');

// id is created by mongoose when we save a document
const emailSchema = new mongoose.Schema({
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    from: { type: String, required: true },
    to: { type: [String], required: true, default: [] },
    cc: { type: [String], required: true, default: [] },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    agreementType: { type: Number, required: true },
    // Agreement form data will be defined when a document is created, like this agreementFormData_field(placeholder in template): value
});

emailSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// The first argument to the function below dictates the collection to put new documents in.
// This is fragile
const emailModel = mongoose.model('Email', emailSchema);

module.exports = emailModel;