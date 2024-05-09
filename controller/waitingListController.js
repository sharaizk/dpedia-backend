const WaitingList = require("../models/waitingListModel");
const apiFeatures = require("../utils/apiFeatures");
const sendEmail = require("../utils/email");
const JWT = require("jsonwebtoken");

exports.addToWaitingList = async (req, res) => {
  try {
    const { email, ipAddress } = req.body;

    if (!email || !ipAddress) {
      return res.status(401).json({ err: "details is not valid" });
    }

    const isEmailAlreadyExists = await WaitingList.findOne({
      email: email,
      status: "accepted",
    });

    if (isEmailAlreadyExists) {
      return res.status(409).json({ err: "email already in waiting list" });
    }

    const newEmail = new WaitingList({ email: email, ipAddress: ipAddress });

    const isEmailSaved = await newEmail.save();

    if (!isEmailSaved) {
      return res.status(422).json({ err: "cannot include this email" });
    }

    const token = JWT.sign({ email: email }, process.env.JWT_SECRET);

    await sendEmail({
      email: email,
      subject: "Membership Verification",
      template: __dirname + "/../utils/emails/welcomeEmail.html",
      replacements: {
        redirectURL: `${process.env.REDIRECT_URL_MEMBERSHIP_VERIFICATION}?token=${token}`,
      },
    });

    return res.status(201).json({ data: "email is added successfully" });
  } catch (error) {
    return res.status(500).json({ error: "unexpected server error" });
  }
};

exports.getAllEmails = async (req, res) => {
  try {
    const emailList = await new apiFeatures(
      WaitingList.find({}),
      req.query
    ).pagination().query;

    const totalEmails = await WaitingList.countDocuments({}).exec();

    return res.status(201).json({ data: emailList, totalEmails: totalEmails });
  } catch (error) {
    return res.status(500).json({ error: "unexpected server error" });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "missing credentials" });
    }

    JWT.verify(token, process.env.JWT_SECRET, async (error, decode) => {
      if (error) {
        return res.status(422).json({ error: "cannot verify token" });
      }

      const { email } = decode;

      const waitinglistResponse = await WaitingList.findOneAndUpdate(
        {
          email: email,
          istokenUsed: false,
        },
        { $set: { status: "accepted", istokenUsed: true } }
      );
      
      if (waitinglistResponse) {
        return res.status(201).json({ data: "token verified" });
      }
      return res.status(422).json({ error: "verification error" });
    });
  } catch (error) {
    return res.status(500).json({ error: "unexpected server error" });
  }
};
