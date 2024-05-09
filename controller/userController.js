const appError = require('../utils/appError');
const emailHandler = require('../utils/email');
const User = require("../models/userModel");
const { catchAsync } = require("../controller/errorController");
const apiFeatures = require("../utils/apiFeatures");

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Generate error if the user tries to change the password
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new appError(
        "Cannot change password through this route. Please go to /update-password",
        400
      )
    );
  }
  // 2) Filter out the unwanted field names
  const filterBody = filterObj(req.body, "name", "email"); // filter the fields to have only these fields

  // 3) Update User document
  const updatedUser = await Users.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});
exports.getAdminMembers = catchAsync(async (req, res, next) => {
  const adminMemberResponse = await new apiFeatures(
    User.find(),
    req.query
  ).pagination().query;
  const totalAdmins = await User.countDocuments();
  if (!adminMemberResponse) {
    return next(new appError("No Admins Found", 404));
  }

  return res
    .status(200)
    .json({ users: adminMemberResponse, totalUsers: totalAdmins });
});

exports.getAdminDetails = catchAsync(async (req, res, next) => {
  const { userId } = req.query;
  if (!userId) {
    return next(new appError("No userId provided", 401));
  }
  const adminDetailResponse = await User.findOne({ _id: userId, role: "admin" });
  if (!adminDetailResponse) {
    return next(new appError("No Admin Found", 404));
  }

  return res.status(200).json({
    detail: adminDetailResponse,
  });
});
