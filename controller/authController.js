const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { promisify } = require("util");
const catchAsync = require("./errorController").catchAsync;
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");
const apiFeatures = require("../utils/apiFeatures");
const cookie = require("cookie");
const { OAuth2Client } = require("google-auth-library");
const { preProcessFile } = require("typescript");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const bcrypt = require("bcryptjs");

const createUser = async (data) => {
  const user = new User({ ...data });

  //if user signup as a student
  if (data.role == "student") {
    user.set({
      student: {
        freeQuestion: 0,
        interest: "",
      },
    });
    user.set({
      tutor: undefined,
    });
  }
  //if user sign up a tutor
  else if (data.role == "tutor") {
    user.set({
      tutor: {
        bidsRemaining: 10,
        createdAt: Date(),
        level: "1",
        tier: "silver",
        description: "",
      },
    });
  }

  //saving user data in database
  const result = await user.save();

  return result;
};

//Adding User
exports.createUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    gender,
    password,
    role,
    passwordConfirm,
  } = req.body;
  // If incomplete data is found
  if (
    !firstName ||
    !lastName ||
    !email ||
    !gender ||
    !password ||
    !role ||
    !passwordConfirm
  ) {
    return res.status(406).json({ message: "Please Fill out the form" });
  }
  // If passwords are not same
  if (password !== passwordConfirm) {
    return res.status(400).json({ message: "Passwords don't match" });
  }
  try {
    // Checking if the user with the email already exists
    const emailAlreadyExists = await User.checkIfEmailExists(email);
    if (emailAlreadyExists)
      return res
        .status(400)
        .json({ message: "User Already Existst with this email" });

    // Saving new user
    const user = new User({
      firstName,
      lastName,
      email,
      gender,
      password,
      role,
    });
    const savedUser = await user.save();
    if (savedUser)
      return res
        .status(200)
        .json({ data: savedUser, message: "User signed up successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong while signing up",
    });
  }
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please Enter email and password", 406));
  }
  const user = await User.findOne({
    email: new RegExp(email, "i"),
    role: { $nin: ["searcher", "manager", "admin"] },
  }).select("+password"); // this + sign is used when we want to select a field that is originally excluded from mongoose select in model

  if (!user) {
    return next(new AppError("Email does not exist", 404));
  }
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError("Email or Password is incorrect", 401));
  }
  createSendToken(user, 200, res);
});

exports.loadUserProfile = catchAsync(async (req, res, next) => {
  const { userId } = req.user;
  console.log(userId);
  const userExists = await User.findOne({ _id: userId }, { password: 0 });
  if (userExists) {
    return res.status(200).send({ data: userExists });
  } else {
    return next(new AppError("User doesn't exist or altered token", 404));
  }
});

exports.checkEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const emailExists = apiFeatures();
});

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET);
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);

  const expiresIn = process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000;
  const cookieOptions = {
    // convert days to
    maxAge: expiresIn,
    expires: new Date(Date.now() + expiresIn),
    // httpOnly: process.env.NODE_ENV === 'production' ? true : false,
    // httpOnly: true,
    domain:
      process.env.NODE_ENV === "production"
        ? process.env.NODE_ENV.host
        : "127.0.0.1",
    path: "/",
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true; // The cookie should be sent over a secure https connection
  }

  // delete the password from the output
  user.password = undefined;
  user.active = undefined;
  res.cookie("dpedia-token", token, cookieOptions);

  // res.cookie('token', token)
  // res.cookie('user', user._id)

  res.status(statusCode).json({
    status: "success",
    token,
    expiresIn,
    data: {
      user: user,
    },
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Getting token and check if token exists
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please login to get access", 401)
    );
  }

  // 2) Validate the verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWt_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError("The user you are trying to login does not exist", 401)
    );

  // 4) Check if user changed password after the JWT token was issued
  if (currentUser.passwordChangeAfter(decoded.iat)) {
    return next(
      new AppError(
        "The password has been changed after the user logged in and you are not authorized anymore",
        401
      )
    );
  }

  // Grant access to protected routeflogin
  req.user = currentUser;
  next();
});

// function wrapper to return the middleware function but with the generated roles array
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user.role);
    console.log(roles);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("no email provided", 400));
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return next(new AppError("There is no user with this email address", 404));
  }

  const token = jwt.sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: 300,
  });

  //save token in respective user
  const isTokenSaved = User.savePasswordResetToken(email, token);

  if (!isTokenSaved) {
    return next(new AppError("Unable to generate token", 422));
  }

  try {
    await sendEmail({
      email: email,
      subject: "Reset your password (5 mins only)",
      template: __dirname + "/../utils/emails/forgotPassword.html",
      replacements: {
        firstName: user.firstName,
        lastName: user.lastName,
        redirectURL: `${process.env.REDIRECT_URL_PASSWORD_RESET}?token=${token}`,
      },
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500
      )
    );
  }

  return res.status(201).json({ data: "email is sent for reset" });
});

exports.verifyToken = catchAsync(async (req, res, next) => {
  const { token: resetToken } = req.body;

  if (!resetToken) {
    return next(new AppError("missing credentials", 400));
  }

  jwt.verify(resetToken, process.env.JWT_SECRET, async (error, decode) => {
    if (error) {
      return next(new AppError("token is expired", 410));
    }
    const { email } = decode;

    const isTokenValid = await User.findOne({
      email: email,
      passwordResetToken: resetToken,
    });

    if (!isTokenValid) {
      return next(new AppError("token is expired", 410));
    }

    return res.status(201).json({ data: "token is valid" });
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;
  const { token: resetToken } = req.params;

  if (!password || !resetToken) {
    return next(new AppError("missing credentials", 400));
  }

  jwt.verify(resetToken, process.env.JWT_SECRET, async (error, decode) => {
    if (error) {
      return next(new AppError("token is expired", 410));
    }
    const { email } = decode;

    const encryptedPassword = await bcrypt.hash(password, 12);

    const updatePassword = await User.findOneAndUpdate(
      { email: email, passwordResetToken: resetToken },
      { $set: { password: encryptedPassword, passwordResetToken: "" } }
    );

    if (!updatePassword) {
      return next(new AppError("token expired", 410));
    }

    return res.status(201).json({ data: "password has been reset login" });
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user
  user = await User.findById(req.user.id).select("+password");
  // 2) Check if the Password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  // 3) Log user in, send jwt
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Create the jwt token and send the response back to user
  createSendToken(user, 200, res);
});

//User Login
// exports.signinUser = catchAsync(async (req, res, next) => {
//   let fetchedUser;
//   //checking email
//   const user = await User.findOne({ email: req.body.email });
//   //If email does not exist
//   if (!user) {

//     return res.status(404).json({
//       message: "This Email does not exist!"
//     })
//   }
//   fetchedUser = user;
//   const result = await bcrypt.compare(req.body.password, user.password);
//   role = "";
//   //If password is incorrect
//   if (!result) {
//     return res.status(400).json({
//       message: "Password is incorrect!"
//     });

//   }
//   //Fetching role of user as a student or tutor while logIn
//   if (fetchedUser.student.createdAt) {
//     role = "student";
//   }
//   else if (fetchedUser.tutor.createdAt) {
//     role = "tutor";
//   }
//   //Generating token for login and expiry time

//   const token = jwt.sign({ email: fetchedUser.email, userId: fetchedUser._id, role: role }, "secret_this_should_be_longer",
//     { expiresIn: "1h" });
//   res.status(200).json({
//     token: token,
//     expiresIn: 3600,
//     userId: fetchedUser._id,
//     role: role,
//     message: "User Login Successfully"
//   });
// });

// passport.use(new GoogleStrategy({
//   clientID: process.env.GOOGLE_CLIENT_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//   callbackURL: process.env.GOOGLE_CALLBACK
// },
//   function (accessToken, refreshToken, profile, cb) {
//     console.log('find or create');
//     console.log(profile);
//     User.findOrCreate({ googleId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));

exports.googleLogin = catchAsync(async (req, res, next) => {
  // console.log(req.body.token)
  if (req.body.token) {
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const {
      given_name,
      family_name,
      email,
      picture,
      sub,
    } = ticket.getPayload();
    // console.log(ticket);

    // Check if user is already registered
    let user = await User.findOne({ email });
    const random = Math.random() + Date.now();
    if (!user) {
      console.log("creating new user");
      data = {
        firstName: given_name,
        lastName: family_name,
        email: email,
        oAuthProvider: "google",
        oAuthSub: sub,
        password: random,
        passwordConfirm: random,
        role: "student",
        image: picture,
      };
      user = await createUser(data);
      // Send created response
      return createSendToken(user, 201, res);
    }

    // Update user image depending on google images if the image is not already set
    if (!user.image) {
      user.set({
        oAuthProvider: "google",
        oAuthSub: sub,
        image: picture,
      });
      user = await user.save({ validateBeforeSave: false });
    }
    // if the user is found then send the success token
    return createSendToken(user, 200, res);
  }
  res.status(401).json({
    message: "Not Authorized",
  });
});
