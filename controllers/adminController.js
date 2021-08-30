const db = require('../models') 
const Restaurant = db.Restaurant
const Category = db.Category
const User = db.User
const fs = require('fs')
const restaurant = require('../models/restaurant')
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const { isError } = require('util')
const IMGUR_CLIENT_ID = '211e51de91aa4f4'


const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest:true,
      include: [Category]
    }).then(restaurants => {
      return res.render('admin/restaurants', { restaurants })
    })
  },
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    const { file } = req
    if ( !name || !tel || !address || !opening_hours || !description ) {
      req.flash('error_messages', "Please fill in all the blanks")
      return res.redirect('back')
    }
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({
          name, tel, address, opening_hours, description,
          image: file ? img.data.link : null
        }).then((restaurant) => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
      })
    } else {
      return Restaurant.create({
        name, tel, address, opening_hours, description,
        image: null
      }).then((restaurant) => {
        req.flash('success_messages', 'restaurant was successfully created')
        return res.redirect('/admin/restaurants')
      })
    }
  },
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { 
      include: [Category]
     })
      .then(restaurant => {
        console.log(restaurant)
        return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
      })
  },
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, {raw:true})
      .then(restaurant => {
        return res.render('admin/create', { restaurant })
      })
  },
  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    const { file } = req
    if (!name || !tel || !address || !opening_hours || !description) {
      req.flash('error_messages', "Forms can't be empty")
      return res.redirect('back')
    }

    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID);
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id)
          .then((restaurant) => {
            restaurant.update({
            name, tel, address, opening_hours, description,
            image: file ? img.data.link : restaurant.image
            })
            .then((restaurant) => {
              req.flash('success_messages', 'restaurant was successfully created')
              return res.redirect('/admin/restaurants')
            })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
          name, tel, address, opening_hours, description,
          image: restaurant.image
          })
          .then((restaurant) => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
        })
    }
  },
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        restaurant.destroy()
          .then(restaurant => {
            res.redirect('/admin/restaurants')
          })
      })
  },
  getUsers: (req, res) => {
    return User.findAll({raw: true}).then(users => {
      const currentUser = helpers.getUser(req).id
      return res.render('admin/users', { users, currentUser })
    })
  },
  toggleAdmin: (req, res) => {
    const id = req.params.id
    const currentUser = helpers.getUser(req).id
    return User.findByPk(id).then(user => {
      // if (user.id === currentUser ) {
      //   req.flash('error_messages', `帳號正在使用中，無法更改使用者權限 !!!`)
      //   return res.redirect('/admin/users')
      // }
      user.isAdmin === false ? user.isAdmin = true : user.isAdmin = false
      return user.update({ isAdmin: user.isAdmin })
        .then(() => {
          req.flash('success_messages', `成功修改${user.name}的使用者權限`)
          res.redirect('/admin/users')
        })
    })
  }
}

module.exports = adminController