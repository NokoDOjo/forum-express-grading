const db = require('../models') 
const Restaurant = db.Restaurant

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
    if ( !name || !tel || !address || !opening_hours || !description ) {
      req.flash('error_messages', "Please fill in all the blanks")
      return res.redirect('back')
    }
    return Restaurant.create({ name, tel, address, opening_hours, description })
      .then((restaurant) => {
        req.flash('success_messages', 'restaurants was  successfully created')
        res.redirect('/admin/restaurants')
      })
  }
}

module.exports = adminController