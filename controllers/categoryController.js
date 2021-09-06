const db = require('../models')
const Category = db.Category
const adminService = require('../services/adminService')
const adminController = require('./adminController')

let categoryController = {
  getCategories: (req, res, next) => {
    adminService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  postCategory: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.create({
        name: req.body.name
      })
        .then(category => {
          res.redirect('/admin/categories')
        }).catch(next)
    }
  },
  putCategory: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', 'name didn\'t exist')
      return res.redirect('back')
    } else {
      return Category.findByPk(req.params.id)
        .then((category) => {
          category.update(req.body)
            .then((category) => {
              res.redirect('/admin/categories')
            })
        }).catch(next)
    }  
  },
  deleteCategory: (req, res, next) => {
    return Category.findByPk(req.params.id)
      .then((category) => {
        category.destroy()
          .then((category) => {
            res.redirect('/admin/categories')
          })
      }).catch(next)
  }
}
module.exports = categoryController