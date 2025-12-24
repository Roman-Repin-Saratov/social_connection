const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    telegramId: { type: String, required: true, unique: true },
    username: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    // Global role in the system (not per-conference)
    globalRole: {
      type: String,
      enum: ['main_admin', 'conference_admin', 'user'],
      default: 'user',
    },
  },
  { timestamps: true }
);

// telegramId already has unique: true which creates an index automatically
// No need for explicit index

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
};


