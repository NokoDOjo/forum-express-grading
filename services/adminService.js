const adminController = require('../controllers/adminController');
const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  getRestaurants: (req, res, cb, next) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category],
    })
      .then((restaurants) => {
        cb({ restaurants });
      })
      .catch(next);
  },
  getRestaurant: (req, res, cb, next) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category],
    })
      .then((restaurant) => {
        cb({ restaurant });
      })
      .catch(next);
  },
  getCategories: (req, res, cb, next) => {
    return Category.findAll({ raw: true, nest: true })
      .then((categories) => {
        if (req.params.id) {
          Category.findByPk(req.params.id)
            .then((category) => {
              category = category.toJSON();
              return cb({ categories, category });
            })
            .catch((err) => console.log(err));
        } else {
          return cb({ categories });
        }
      })
      .catch(next);
  },
  deleteRestaurant: (req, res, cb) => {
    return Restaurant.findByPk(req.params.id).then((restaurant) => {
      restaurant.destroy().then((restaurant) => {
        cb({ status: "success", message: "" });
      });
    })
  },
};

module.exports = adminService