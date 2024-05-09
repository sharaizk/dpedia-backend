const mongoose = require("mongoose");
exports.connect = () => {
  mongoose
    .connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify:false
    })
    .then(() => {
      console.log("Done: connected to database");
    })
    .catch((err) => {
      console.log(err);
      console.log("connection failed");
    });
};
