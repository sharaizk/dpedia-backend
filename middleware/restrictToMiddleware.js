exports.verifyRole = (role) => {
  return (req, res, next) => {
    const { user } = req;
    if (!user) {
      return res
        .status(401)
        .json({ error: "unexpected error occured", data: null });
    }
    if (role.includes(user.role)) {
      return next();
    }
    return res
      .status(403)
      .json({ error: "user not authorized for this operation", data: null });
  };
};
