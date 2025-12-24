const mongoose = require('mongoose');

const { Schema } = mongoose;

const questionSchema = new Schema(
  {
    conference: { type: Schema.Types.ObjectId, ref: 'Conference', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'UserProfile' },
    text: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    isAnswered: { type: Boolean, default: false },
    answer: { type: String }, // Answer text from speaker
    answeredBy: { type: Schema.Types.ObjectId, ref: 'UserProfile' }, // Speaker who answered
    targetSpeaker: { type: Schema.Types.ObjectId, ref: 'UserProfile' }, // Specific speaker or null for all
    upvoters: [{ type: Schema.Types.ObjectId, ref: 'UserProfile' }],
  },
  { timestamps: true }
);

// Performance indexes per spec
questionSchema.index({ conference: 1, isAnswered: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = {
  Question,
};


