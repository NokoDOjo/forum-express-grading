const bcrypt = require('bcryptjs') 
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const followship = require('../models/followship')
const IMGUR_CLIENT_ID = '211e51de91aa4f4'

const userController = {
  signUpPage: (req, res, next) => {
    return res.render('signup')
  },

  signUp: (req, res, next) => {
    if (req.body.passwordCheck !== req.body.password) {
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      User.findOne({where: {email: req.body.email}}).then(user => {
        if(user){
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          }).catch(next)  
        }
      })  
    }
  },
  signInPage: (req, res, next) => {
    return res.render('signin')
  },

  signIn: (req, res, next) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res, next) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [
        { model: User, as: 'Followers'},
        { model: User, as: 'Followings'},
        { model: Comment, include: [Restaurant]},
        { model: Restaurant, as: 'FavoritedRestaurants'}
      ]
    })
      .then(user => {
        const isFollowed = user.Followers.map(d => d.id).includes(helpers.getUser(req).id)
        // 收藏的餐廳
        let restaurants = user.dataValues.FavoritedRestaurants
        restaurants = user.dataValues.FavoritedRestaurants.map(restaurant => ({
          ...restaurant.dataValues
        }))
        const restNum = Number(restaurants.length)
        // 剔除重複留言的餐廳
        let commentedRestaurants = user.Comments.map(e => e.Restaurant.dataValues)
        const set = new Set()
        commentedRestaurants = commentedRestaurants.filter(res => !set.has(res.id) ? set.add(res.id) : false)
        const commentedRestNum = Number(commentedRestaurants.length)
        // 追蹤的使用者
        let followers = user.dataValues.Followers
        followers = followers.map(follower => ({
          ...follower.dataValues
        }))
        const followerNum = Number(followers.length)
        // 追隨的使用者
        let followings = user.dataValues.Followings
        followings = followings.map(followings => ({
          ...followings.dataValues
        }))
        const followingNum = Number(followings.length)
        return res.render('user', { 
          user: user.toJSON(),
          commentedRestNum,
          restNum,
          followerNum,
          followingNum,
          isFollowed,
          restaurants,
          followers,
          followings,
          commentedRestaurants })
      }).catch(next)
  },
  editUser: (req, res, next) => {
    const currentUser = helpers.getUser(req).id
    if ( currentUser !== Number(req.params.id) ) {
      console.log(currentUser, req.params.id)
      req.flash('error_messages', '無法編輯其他使用者資料')
      return res.redirect(`/users/${currentUser}`)
    }
    User.findByPk(req.params.id)
      .then(user => {
        return res.render('profileEdit', { user: user.toJSON() })
      }).catch(next)
  },
  putUser: (req, res, next) => {
    if (!req.body.name) {
      req.flash('error_messages', '使用者名稱為必填')
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        if (err) console.log(`Error: ${err}`)
        return User.findByPk(req.params.id)
          .then(user => {
            user.update({
              name: req.body.name,
              image: file ? img.data.link : user.image
            })
            .then(() => {
              req.flash('success_messages', '已成功編輯使用者資料')
              res.redirect(`/users/${req.params.id}`)
            })
          }).catch(next)
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          })
          .then(() => {
            req.flash('success_messages', '已成功編輯使用者資料')
            res.redirect(`/users/${req.params.id}`)
          })
        }).catch(next)
    }
  },
  addFavorite: (req, res, next) => {
    return Favorite.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      }).catch(next)
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        favorite.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      }).catch(next)
  },
  addLike: (req, res, next) => {
    return Like.create({
      UserId: req.user.id,
      RestaurantId: req.params.restaurantId
    })
      .then(restaurant => {
        return res.redirect('back')
      }).catch(next)
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        UserId: req.user.id,
        RestaurantId: req.params.restaurantId
      }
    })
      .then(like => {
        like.destroy()
          .then(restaurant => {
            return res.redirect('back')
          })
      }).catch(next)
  },
  getTopUser: (req, res, next) => {
    return User.findAll({
      include: [
        { model: User, as: 'Followers' }
      ]
    }).then(users => {
      // 整理user資料
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      // 依追蹤者人數排序清單
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users })
    }).catch(next)
  },
  addFollowing: (req, res, next) => {
    return Followship.create({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(followship => {
        return res.redirect('back')
      }).catch(next)
  },
  removeFollowing: (req, res, next) => {
    return Followship.findOne({
      followerId: req.user.id,
      followingId: req.params.userId
    })
      .then(followship => {
        followship.destroy()
          .then(followship => {
            return res.redirect('back')
          })
      }).catch(next)
  }

}

module.exports = userController