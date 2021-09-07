const adminController = require('../controllers/adminController');
const db = require('../models')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = "211e51de91aa4f4"
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
  postRestaurant: (req, res, cb, next) => {
    const { name, tel, address, opening_hours, description } = req.body;
    const { file } = req;
    if (!req.body.name) {
      return callback({ status: "error", message: "name didn't exist" });
    }
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name,
          tel,
          address,
          opening_hours,
          description,
          image: file ? img.data.link : null,
          CategoryId: req.body.categoryId,
        })
          .then((restaurant) => {
            cb({ status: 'success', message: 'restaurant was successfully created'})
          })
          .catch(next);
      });
    } else {
      return Restaurant.create({
        name,
        tel,
        address,
        opening_hours,
        description,
        image: null, 
      })
        .then((restaurant) => {
          cb({ status: 'success', message: 'restaurant was successfully created'})
        })
        .catch(next);
    }
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