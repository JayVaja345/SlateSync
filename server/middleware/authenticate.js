const jwt = require("jsonwebtoken");
const userdb = require("../Model/userSchema");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json("Access Denied: No token provided");
    }

    const token = authHeader.split(" ")[1];

    const verified = jwt.verify(token, process.env.JWT_SECRET);

    const rootUser = await userdb.findOne({ _id: verified._id });
    console.log("👤 Found User:", rootUser);

    if (!rootUser) {
      return res.status(401).json("Invalid Token: User not found");
    }

    req.user = rootUser;
    req.token = token;
    req.userId = rootUser._id;

    console.log("🔄 Passing to next middleware");

    next();
  } catch (error) {
    console.error("🔴 Auth Error:", error);
    return res.status(401).json({
      error: "Invalid token",
      details: error.message,
    });
  }
};

module.exports = authenticate;
