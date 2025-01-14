const { sequelize } = require('../models')
const db = require('../models')
const restaurant = require('../models/restaurant')
const user = require('../models/user')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10


const restController = {
  getRestaurants: (req, res, next) => {
    let offset = 0
    const whereQuery = {}
    let categoryId = ''
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    if (req.query.categoryId) {
      categoryId = Number(req.query.categoryId)
      whereQuery.CategoryId = categoryId
    }
    Restaurant.findAndCountAll({ 
      include: Category,
      where: whereQuery,
      offset,
      limit: pageLimit
    }).then(result => {
      // data for pagination
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page -1
      const next = page + 1 > pages ? pages : page + 1

      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      Category.findAll({
        raw: true,
        nest: true
      }).then(categories => {
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          page,
          totalPage,
          prev,
          next
        })
      })
    }).catch(next)
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: User, as: 'FavoritedUsers'},
        { model: User, as: 'LikedUsers'},
        { model: Comment, include: [User]}
      ]
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(req.user.id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(req.user.id)
      return res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })
    }).catch(next)
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        limit: 10,
        raw: true,
        nest: true,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', {
        restaurants,
        comments
      })
    }).catch(next)
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, { include: [
        Category,
        { model: Comment }
      ] })
      .then(restaurant => {
        restaurant.increment('viewCounts', { by: 1 })
        return res.render('dashboard', { restaurant: restaurant.toJSON() })
      }).catch(next)
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      limit: 10,
      order: [["favoriteCounts", "DESC"]],
      include: [{model: User, as: 'FavoritedUsers'}]
    })
      .then((restaurants) => {
        restaurants = restaurants.map((restaurant) => ({
          ...restaurant.dataValues,
          FavoritedCount: restaurant.FavoritedUsers.length,
          isFavorited: restaurant.FavoritedUsers.map((d) => d.id).includes(
            req.user.id
          ),
        }));
        return res.render("topRestaurant", { restaurants });
      })
      .catch(next);
  }
}
module.exports = restController