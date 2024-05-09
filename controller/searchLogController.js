const searchLog = require("../models/searchLogModel");
const apiFeatures = require("../utils/apiFeatures");

exports.getAllSearchLog = async (req, res) => {
  try {
    const data = await new apiFeatures(searchLog.find(), req.query).pagination()
      .query;
    const totalSearchlog = await searchLog.countDocuments({}).exec();
    return res.status(201).json({ data, totalSearchlog });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: "unexpected server error" });
  }
};
