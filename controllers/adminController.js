const db = require('../models') 
const Restaurant = db.Restaurant
const fs = require('fs')
const restaurant = require('../models/restaurant')

const adminController = {
  getRestaurants: (req, res) => {
    return Restaurant.findAll({raw: true}).then(restaurants => {
      return res.render('admin/restaurants', {restaurants: restaurants })
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
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.create({
            name, tel, address, opening_hours, description,
            image: file ? `/upload/${file.originalname}` : null
          }).then((restaurant) => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
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
    return Restaurant.findByPk(req.params.id, { raw:true })
      .then(restaurant => {
        return res.render('admin/restaurant', { restaurant })
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
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Restaurant.findByPk(req.params.id)
            .then((restaurant) => {
              restaurant.update({
              name, tel, address, opening_hours, description,
              image: file ? `/upload/${file.originalname}` : restaurant.image
              })
              .then((restaurant) => {
                req.flash('success_messages', 'restaurant was successfully created')
                return res.redirect('/admin/restaurants')
              })
            })
        })
      })
    } else {
      return Restaurant.findByPk(req.params.id)
        .then((restaurant) => {
          restaurant.update({
          name, tel, address, opening_hours, description,
          image: file ? `/upload/${file.originalname}` : restaurant.image
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
  }
}

module.exports = adminController