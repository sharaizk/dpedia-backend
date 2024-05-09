var cron = require("node-cron");
const MemberShipModel = require("../models/membership.model");

const cronJob = cron.schedule("0 0 * * *", async () => {
  try {
    await MemberShipModel.update(
      {},
      [{ $set: { remainingLimit: "$dailyLimit" } }],
      { multi: true }
    );
  } catch (err) {
    console.log(err);
  }
});

module.exports = cronJob;
