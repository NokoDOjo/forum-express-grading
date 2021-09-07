const express = require("express");
const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const router = express.Router();

const passport = require('../config/passport')

const adminController = require("../controllers/api/adminController.js");
const categoryController = require("../controllers/api/categoryController.js");
const userController = require('../controllers/api/userController')

const authenticated = passport.authenticate('jwt', { session: false })
const authenticatedAdmin = (req, res, next) => {
  if (req.user) {
    if (req.user.isAdmin) { return next() }
    return res.json({ status: 'error', message: 'permission denied' })
  } else {
    return res.json({ status: 'error', message: 'permission denied' })
  }
}

router.get("/admin/restaurants", authenticated, authenticatedAdmin, adminController.getRestaurants);

router.post('/admin/restaurants', upload.single('image'), adminController.postRestaurant)

router.put('/admin/restaurants/:id', upload.single('image'), adminController.putRestaurant)

router.get("/admin/restaurants/:id", adminController.getRestaurant);

router.delete('/admin/restaurants/:id', adminController.deleteRestaurant)

router.get('/admin/categories', categoryController.getCategories)

router.post('/admin/categories', categoryController.postCategory)

router.put('/admin/categories/:id', categoryController.putCategory)

router.delete('/admin/categories/:id', categoryController.deleteCategory)

// JWT signIn
router.post('/signin', userController.signIn)

router.post('signup', userController.signUp)




module.exports = router;
