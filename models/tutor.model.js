const mongoose = require("mongoose");

const tutorModel = mongoose.Schema({
  bidsRemaining: {
    type: String,
  },
  level: {
    type: Number,
    enum: [1, 2, 3, 4],
  },
  tier: {
    type: String,
    enum: ["silver", "gold", "platinum"],
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  bidQuestion: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
    },
  ],
  experience: [
    {
      title: { type: String },
      description: { type: String },
      startingDate: { type: Date },
      endingDate: { type: Date },
    },
  ],
  education: [
    {
      country: { type: String },
      degreeName: { type: String },
      startingDate: { type: Date },
      endingDate: { type: Date },
      institute: { type: String },
      description: { type: String },
    },
  ],

  project: [
    {
      name: { type: String },
      oAuthProvider: { type: String },
      oAuthSub: { type: String },
      completionDate: { type: Date },
      company: { type: String },
      institute: { type: String },
    },
  ],

  skills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
  ],
});
