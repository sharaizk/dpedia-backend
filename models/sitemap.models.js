const mongoose = require("mongoose");

const sitemapSchema = mongoose.Schema({
  name: {
    type: String,
  },
  index: {
    type: Number,
    default: 0,
  },
  content: [
    {
      url: {
        type: String,
      },
    },
  ],
  length: {
    type: Number,
    default: 0,
  },
});

sitemapSchema.statics.getRecentSitemap = async function() {
  const lastCreatedSitemap = await this.findOne({}).sort({ $natural: 1 });
  return lastCreatedSitemap;
};

sitemapSchema.statics.createNewSitemap = async function(name, index, link) {
  const newSitemap = await this.create({
    content: { url: link },
    index: index || 0,
    name: name,
    length: 1,
  });
  return newSitemap;
};

sitemapSchema.statics.addToSitemap = async function(sitemapId, link) {
  const updateSitemap = await this.findOneAndUpdate(
    { _id: sitemapId },
    {
      $push: { content: { url: link } },
      $inc: { length: 1 },
    }
  );
  return updateSitemap;
};

const sitemap = mongoose.model("sitemap", sitemapSchema);
module.exports = sitemap;
