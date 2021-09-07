const db = require('../models') 
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const adminService = require('../services/adminService.js')
const fs = require('fs')
const restaurant = require('../models/restaurant')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const { isError } = require('util')
const IMGUR_CLIENT_ID = '211e51de91aa4f4'


const adminController = {
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render("admin/restaurants", data);
    });
  },
  createRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true,
      nest: true,
    })
      .then((categories) => {
        return res.render("admin/create", { categories });
      })
      .catch(next);
  },
  postRestaurant: (req, res, next) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_messages', data['message'])
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  getRestaurant: (req, res, next) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
  },
  editRestaurant: (req, res, next) => {
    Category.findAll({
      raw: true,
      nest: true,
    })
      .then((categories) => {
        return Restaurant.findByPk(req.params.id).then((restaurant) => {
          return res.render("admin/create", {
            categories,
            restaurant: restaurant.toJSON(),
          });
        });
      })
      .catch(next);
  },
  putRestaurant: (req, res, next) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data['status'] === 'error') {
        req.flash('error_message', data['message'])
      }
      req.flash('success_messages', data['message'])
      res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res, next) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data['status'] === 'success') {
        return res.redirect('/admin/restaurants')
      }
    })
  },
  getUsers: (req, res, next) => {
    return User.findAll({ raw: true })
      .then((users) => {
        const currentUser = helpers.getUser(req).id;
        return res.render("admin/users", { users, currentUser });
      })
      .catch(next);
  },
  toggleAdmin: (req, res, next) => {
    const id = req.params.id;
    const currentUser = helpers.getUser(req).id;
    return User.findByPk(id).then((user) => {
      // if (user.id === currentUser ) {
      //   req.flash('error_messages', `帳號正在使用中，無法更改使用者權限 !!!`)
      //   return res.redirect('/admin/users')
      // }
      user.isAdmin === false ? (user.isAdmin = true) : (user.isAdmin = false);
      return user
        .update({ isAdmin: user.isAdmin })
        .then(() => {
          req.flash("success_messages", `成功修改${user.name}的使用者權限`);
          res.redirect("/admin/users");
        })
        .catch(next);
    });
  },
};

module.exports = adminController