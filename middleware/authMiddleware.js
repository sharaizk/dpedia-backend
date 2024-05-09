const jwt = require('jsonwebtoken');
const authToken = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decodeToken.id, role: decodeToken.role };
    return next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      message: "Auth Failed",
    });
  }
}

module.exports = authToken