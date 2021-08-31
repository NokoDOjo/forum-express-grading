const bcrypt = require('bcryptjs') 
const db = require('../models')
const User = db.User
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const { fakeServer } = require('sinon')
const IMGUR_CLIENT_ID = '211e51de91aa4f4'

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
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
          })  
        }
      })  
    }
  },
  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },
  getUser: (req, res) => {
    return User.findByPk(req.params.id)
      .then(user => {
        return res.render('user', { user: user.toJSON() })
      })
  },
  editUser: (req, res) => {
    const currentUser = helpers.getUser(req).id
    if ( currentUser !== Number(req.params.id) ) {
      console.log(currentUser, req.params.id)
      req.flash('error_messages', '無法編輯其他使用者資料')
      return res.redirect(`/users/${currentUser}`)
    }
    User.findByPk(req.params.id)
      .then(user => {
        return res.render('profileEdit', { user: user.toJSON() })
      })
  },
  putUser: (req, res) => {
    if (!req.body.name) {
      req.flash('error_messages', '使用者名稱為必填')
      console.log(req.body.name)
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
          })
      })
    } else {
      return User.findByPk(req.params.id)
        .then(user => {
          user.update({
            name: req.body.name,
            image: user.image
          })
        })
          .then(() => {
            req.flash('success_messages', '已成功編輯使用者資料')
            res.redirect(`/users/${req.params.id}`)
          })
    }
  }

}

module.exports = userController