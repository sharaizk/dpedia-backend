const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const bookSchema = mongoose.Schema(
  {
    BookNumber: { type: Number },
    old_id: { type: Number },
    title: { type: String, required: true },
    description: { type: String },
    authorName: { type: String, required: true },
    ISBN: { type: String },
    coverImage: { type: String },
    publisher: { type: String },
    publishDate: { type: Date },
    edition: { type: String },
    completionDate: { type: Date },
    BookFile: { type: String },
    assignDate: { type: Date },
    assignee: { type: String },
    listOfChapter: [
      {
        type: String,
      },
    ],
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    totalQuestions: { type: Number },
    totalViews: { type: Number },
    slug: {
      type: String,
      slug: "title",
      slug_padding_size: 2,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
bookSchema.plugin(AutoIncrement, { inc_field: "bookNumber" });
bookSchema.virtual("solutionCount", {
  ref: "solution",
  foreignField: "book",
  localField: "_id",
});

bookSchema.plugin(slug);
module.exports = mongoose.model("book", bookSchema);
