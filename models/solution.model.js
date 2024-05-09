const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const Cryptr = require("cryptr");
const appError = require("../utils/appError");
const { catchAsync } = require("../controller/errorController");
const mognoosastic = require("mongoosastic");
const elasticSearch = require("@elastic/elasticsearch");
const BookModel = require("./book.model");
const CategoryModel = require("./category.model");
const ElasticSearch = require("../utils/elasticSearch");

const options = {
  separator: "-",
  truncate: 120,
};

const solutionSchema = mongoose.Schema(
  {
    solutionNumber: { type: Number },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "book",
      es_indexed: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      es_indexed: true,
    },
    old_id: { type: Number },
    price: { type: Number, required: [true] },
    title: { type: String, required: true, es_indexed: true }, //, es_indexed: true },
    question: { type: String, required: true, es_indexed: true }, //, es_indexed: true },  // This description is the question
    answer: { type: String, select: false },
    status: {
      type: Boolean,
      required: [true, "Status can either be true or false"],
    },
    file: { type: String, required: false },
    metaKeywords: { type: String, required: true },
    metaDescription: { type: String, required: true },
    transcribedImageText: { type: String, es_indexed: true }, // es_indexed: true },
    slug: {
      type: String,
      slug: "title",
      slug_padding_size: 2,
      unique: true,
      es_indexed: true,
    },
    noOfOrders: { type: Number, required: true, default: 0 },
    noOfDownloads: { type: Number, default: 0 },
    views: { type: Number, required: true, default: 0 },
    entryInformation: {
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Cryptr for encryption and decryption of data
const cryptr = new Cryptr(process.env.ANSWER_ENCRYPTION_SECREt_KEY);

// Logic related to answer sending field

solutionSchema.pre(/^find/, function(next) {
  // Update the log of the question before saving that what have changed
  // Never select the answer unless the correct token is passed
  // console.log(this._conditixons);
  if (
    this._conditions.hasOwnProperty("token") &&
    this._conditions["token"] === process.env.ANS_VIEW_TOKEN
  ) {
    delete this._conditions["token"];
  } else {
    if (this._userProvidedFields) {
      delete this._userProvidedFields["answer"];
      delete this._fields["answer"];
    }
  }

  next();
});

solutionSchema.pre(/^find/, function(next) {
  // console.log(this);
  this.populate({
    path: "book",
    select: "title authorName slug",
  }).populate({
    path: "category",
    select: "name url parentId slug",
    populate: {
      path: "parentId",
      select: "name url parentId slug",
      populate: { path: "parentId", select: "name url slug" },
    },
  });
  next();
});

solutionSchema.pre("save", function(next) {
  // encrypt the answer using cryptr
  if (this.isNew) {
    this.answer = cryptr.encrypt(this.answer);
    //  this.answer = encryptedString;

    // ElasticSearch.createIndex('solution', {
    //   _id: this._id,
    //   body: {
    //     title: this.title,
    //     question: this.question,
    //     transcribedImageText: this.transcribedImageText
    //   }
    // })
  }

  next();
});

solutionSchema.methods.getSingleSolution = async function(slug) {
  // decrypt the available answer
  if (this.answer) {
    const ans = cryptr.decrypt(this.answer);
    return {
      ...this._doc,
      answer: ans,
    };
  } else return "No answer found";
};

solutionSchema.plugin(AutoIncrement, { inc_field: "solutionNumber" });

solutionSchema.statics.getSolutionId = async function(slug) {
  const res = await this.findOne({ slug: new RegExp(slug, "i") });
  return { _id: res._id, title: res.title };
};

solutionSchema.statics.getDecryptedAnswer = function(encryptedAnswer) {
  const decryptedString = cryptr.decrypt(encryptedAnswer);
  return decryptedString;
};

// solutionSchema.methods.getDecryptedAnswer = catchAsync(async function () {

// })

const esClient = new elasticSearch.Client({
  node: process.env.ESCLIENTHOST,
  auth: {
    username: process.env.ESCLIENTUSERNAME,
    password: process.env.ESCLIENTPASSWORD,
  },
});

solutionSchema.plugin(slug);
solutionSchema.plugin(mognoosastic, {
  esClient: esClient,
});

solutionSchema.virtual("orderCount", {
  ref: "order",
  foreignField: "solutionId",
  localField: "_id",
  count: true,
});

const solution = mongoose.model("solution", solutionSchema);
solution.synchronize();

module.exports = solution;
