const express = require("express");

const { isLoggedIn } = require("./middlewares");
const { addFollowing } = require("../controller/user");

const router = express.Router();

router.post("/:id/follow", isLoggedIn, addFollowing);

module.exports = router;
