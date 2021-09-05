const db = require('../models')
const Category = db.Category
let categoryController = {
  getCategories: (req, res, next) => {
    return Category.findAll({ 
      raw: true,
      nest: true
    }).then(categories => {
      if (req.params.id) {
        Category.findByPk(req.params.id)
          .then(category => {
            return res.render('admin/categories', {
              categories, category: category.toJSON()
            })
          }).catch(next)
      } else {
      return res.render('admin/categories', { categories })
      }
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