const db = require('../models')
const Comment = db.Comment

const CommentController = {
  postComment: (req, res, next) => {
    return Comment.create({
      text: req.body.text,
      RestaurantId: req.body.restaurantId,
      UserId: req.user.id
    })
      .then(comment => {
        res.redirect(`/restaurants/${req.body.restaurantId}`)
      }).catch(next)
  },
  deleteComment: (req, res, next) => {
    return Comment.findByPk(req.params.id)
      .then(comment => {
        comment.destroy()
          .then(comment => {
            res.redirect(`/restaurants/${comment.RestaurantId}`)
          })
      }).catch(next)
  }
}

module.exports = CommentController