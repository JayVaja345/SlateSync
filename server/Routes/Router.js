const express = require("express");
const router = new express.Router();
const controllers = require("../Controller/userController");
const authenticate = require("../middleware/authenticate");
const verifyDocumentAccess = require("../middleware/documentAccess");

router.post("/user/register", controllers.userpost);

router.post("/user/login", controllers.userget);

router.get("/user/profile", authenticate, controllers.userdetails);

router.post("/document/create", authenticate, controllers.createdocument);

router.post("/document/get", authenticate, controllers.getdocument);

router.get("/document/shared", authenticate, controllers.havingaccess);

router.get(
  "/document/:id",
  authenticate,
  verifyDocumentAccess,
  controllers.getsingledocument
);

router.put("/document/update/:id", authenticate, controllers.updatedocument);

router.post("/document/:id/share", authenticate, controllers.givingaccess);

module.exports = router;
