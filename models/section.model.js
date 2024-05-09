const mongoose = require("mongoose");
const sectionSchema = mongoose.Schema({
  bookId: {
    type: mongoose.Schema.ObjectId,
    ref: "books",
    required: [true, "Please provide the book"],
  },
  chapterId: {
    type: mongoose.Schema.ObjectId,
    ref: "chapter",
    required: [true],
  },
  sectionNumber: {
    type: Number,
    required: [true, "Please provide Section Mumber"],
  },
  sectionName: {
    type: String,
    required: [true, "Please provide Section Name"],
  },
});

sectionSchema.static.createNewSection = async function(
  bookId,
  chapterId,
  sectionNumber,
  sectionName
) {
  const newSection = await this.create({
    bookId: bookId,
    chapterId: chapterId,
    sectionNumber: sectionNumber,
    sectionName: sectionName,
  });
  return newSection;
};
