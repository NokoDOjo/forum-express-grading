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
    adminService.postCategory(req, res, (data) => {
      return res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res, next) => {
    adminService.postCategory(req, res, (data) => {
      return res.redirect('/admin/categories')
    })
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