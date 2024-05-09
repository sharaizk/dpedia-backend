const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const AppError = require("../utils/appError");
const crypto = require("crypto");

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      requied: [true, "First Name is required"],
    },
    // middleName: { type: String },
    lastName: { type: String },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please enter a valid email"],
    },

    password: {
      type: String,
      require: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordChangedAt: { type: Date },
    passwordResetToken: {
      type: String,
    },
    oAuthProvider: { type: String },
    oAuthSub: { type: String },

    role: {
      type: String,
      enum: {
        values: [
          "user",
          "student",
          "tutor",
          "admin",
          "moderator",
          "analyst",
          "data-entry",
          "searcher",
          "manager",
          "quality-assurance",
        ],
        message:
          "The user role should be user, student, tutor, admin, moderator, analyst, data-entry, quality-assurance",
      },
      default: "user",
    },

    dob: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    accountStatus: {
      type: String,
      default: "active",
      enum: ["active", "deactive", "suspended", "pending"],
      select: false,
    },

    moblieNo: { type: Number },
    address: {
      city: { type: String },
      street: { type: String },
      state: { type: String },
      country: { type: String },
    },
    image: { type: String },
    credits: { type: Number },
    balance: { type: Number },

    suspend: {
      reason: {},
    },
    notifications: [
      {
        text: { type: String },
        link: { type: String },
        status: {
          type: String,
          enum: ["read", "unread"],
        },
        // notification from the person --  it could be the system
        notifier: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
        createdAt: { type: Date },
      },
    ],
    referredBy: {
      token: { type: String },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
    emailVerification: {
      verificationToken: { type: String },
      emailStatus: { type: Boolean },
      createdAt: { type: Date },
      modifiedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Date of birth Checking Middleware
userSchema.pre("save", function(next) {
  console.log("date of birth middleware");
  if (Date(this.dob) > Date.now()) {
    next(new AppError("Date of Birth should be less than today", 400)); // throw error for date of birth should not be greater than the date of today
  }

  if (this.firstName.length < 3) {
    next(new AppError("First name should contain atleast 3 letters", 400));
  }
  next();
});

// Bcrypting the password and saving it to db
userSchema.pre("save", async function(next) {
  // if password is not modified the return from this method
  console.log("Bcrypting Password ...");
  if (!this.isModified("password")) return next();
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password updated middleware to add passwordChangedAt property
userSchema.pre("save", function(next) {
  // if the password has not been modified then return from this function
  console.log("password checking middleware");
  if (!this.isModified("password") || this.isNew) {
    return next();
  }
  // subtract the password changed at to the past because saving to database is slower than issuing jwt
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method to check if the password has been changed after issuing the jwt token
userSchema.methods.passwordChangeAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    // False means that password does not changed
    // if changed time stamp is greater than the time issued the token
    return JWTTimestamp < changedTimeStamp;
  }

  // it means that password has never been changed
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  // Generate the random token of 32 characters
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Create the hash of the token that has been generate and encrypt it with sha 256
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set the password reset to the 10 minutes in the future
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  // this will be sent through
  return resetToken;
};

userSchema.statics.checkIfEmailExists = async function(email) {
  const emailExists = await this.findOne({ email: new RegExp(email, "i") });
  return emailExists ? true : false;
};

userSchema.statics.savePasswordResetToken = async function(email, token) {
  return await this.findOneAndUpdate(
    { email: email },
    { $set: { passwordResetToken: token } }
  );
};

userSchema.plugin(uniqueValidator, { message: "{PATH} should be unique" });

module.exports = mongoose.model("user", userSchema);
