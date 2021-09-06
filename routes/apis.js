const express = require("express");
const router = express.Router();

const adminController = require("../controllers/api/adminController.js");
const categoryController = require("../controllers/categoryController.js");

router.get("/admin/restaurants", adminController.getRestaurants);

router.get("/admin/restaurants/:id", adminController.getRestaurant)

module.exports = router;
