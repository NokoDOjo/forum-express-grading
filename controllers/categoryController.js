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
    adminService.deleteCategory(req, res, (data) => {
      return res.redirect('/admin/categories')
    })
  }
}
module.exports = categoryController