const mongoose = require("mongoose");
const slug = require("mongoose-slug-generator");

const categoryScheme = mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },
    old_id: { type: Number },
    name: { type: String },
    description: { type: String },
    level: { type: Number },
    iconName: {
      type: String,
    },
    iconColor: {
      type: String,
    },
    subCategories: [
      {
        // reference of childrens in the parent category
        childId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "category",
        },
      },
    ],

    metaTitle: { type: String },
    metaDescription: { type: String },
    metaKeywords: { type: String },
    url: { type: String },
    slug: {
      type: String,
      slug: "metaDescription",
      slug_padding_size: 2,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

categoryScheme.statics.getCategoriesFromId = async function(categoryId) {
  const categories = await this.findOne(
    { _id: categoryId },
    { name: 1, url: 1, _id: 0 }
  ).populate({
    path: "parentId",
    select: "name url -_id",
    populate: [{ path: "parentId", select: "name url -_id" }],
  });
  const category = { _id: categories };
  return category;
};

categoryScheme.statics.getCategoriesFromParent = async function(
  parentCategory
) {
  const categories = await this.aggregate([
    {
      $match: {
        url: parentCategory,
      },
    },
    {
      $project: {
        Level1: "$_id",
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "_id",
        foreignField: "parentId",
        as: "Level2",
        pipeline: [
          {
            $project: { _id: 1 },
          },
          {
            $lookup: {
              from: "categories",
              localField: "_id",
              foreignField: "parentId",
              as: "Level3",
              pipeline: [
                {
                  $project: { _id: 1 },
                },
              ],
            },
          },
        ],
      },
    },
  ]);
  const lev3 = categories[0]?.Level2?.map((lev) =>
    lev.Level3.map((le) => le._id)
  );
  return [
    categories[0]?.Level1,
    ...categories[0]?.Level2?.map((lev) => lev?._id),
    ...lev3?.flat(),
  ];
};

categoryScheme.statics.getCategoriesWithQuesiton = async function() {};

categoryScheme.plugin(slug);

module.exports = mongoose.model("category", categoryScheme);
