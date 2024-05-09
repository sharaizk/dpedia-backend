const mongoose = require("mongoose");

const chapterSchema = mongoose.Schema({
  bookId: {
    type: mongoose.Schema.ObjectId,
    ref: "book",
    required: [true, "Please provide the book"],
  },
  chapterTitle: {
    type: String,
    required: [true, "Please provide Chapter Title"],
  },
  chapterNumber: {
    type: Number,
    required: [true, "Please provide Chapter number"],
  },
});

module.exports = mongoose.model("chapter", chapterSchema);
