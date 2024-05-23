const mongoose = require('mongoose');

// id is created by mongoose when we save a document
const userSchema = new mongoose.Schema({
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    expiresAt: { type: Date, required: true, default: Date.now },
    emailAddress: { type: String, required: true },
    zohoAccountId: { type: String, required: true },
    emails: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Email', required: true }],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// The first argument to the function below dictates the collection to put new documents in.
// This is fragile
const userModel = mongoose.model('User', userSchema);

module.exports = userModel;