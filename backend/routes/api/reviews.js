const express = require('express')
const router = express.Router();

const {  requireAuth } = require('../../utils/auth');
const { User, Review, Spot, SpotImage, ReviewImage } = require('../../db/models');

const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');



// MY CODE //

// GET all Reviews of the Current Use
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;

    const userReviews = await Review.findAll({
        where: { userId: user.id },
        include: [
            {
                model: User,
                attributes: [
                    'id',
                    'firstName',
                    'lastName'
                ]
            },
            {
                model: Spot,
                attributes: { exclude: [
                    'createdAt',
                    'updatedAt',
                    'description'
                ]},
                include: [{model: SpotImage}]
            },
            {
                model: ReviewImage,
                attributes: [
                    'id',
                    'url'
                ]
            },
        ]

    })
// console.log(userReviews)
    let reviewList = [];
    userReviews.forEach(review => {
      reviewList.push(review.toJSON())
    })

      // console.log(reviewList)
    reviewList.forEach(review => {
    //  console.log(review.Spot)
     let spotImageArr = review.Spot.SpotImages
    //  console.log(spotImageArr)
    //  console.log(spotImageArr[0].preview)
     for (let el of spotImageArr) {
      // console.log(el)
      if (el.preview === true) {
        // console.log(review.Spot)
        // console.log(el.url)

        review.Spot.previewImage = el.url
      }
      if (!el.preview) {
        el.previewImage = 'no preview image found'
      }
      delete review.Spot.SpotImages
     }

    })

    // console.log(userReviews)
    return res.json({'Reviews': reviewList})
})


// ADD an Image to a Review based on the Reviews id
router.post('/:reviewId/images', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { url } = req.body;

  const findReview = await Review.findByPk(reviewId);
  if(!findReview) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404
    })
  }

  let bookingObj = findReview.toJSON()
  if (bookingObj.userId !== req.user.id) {
      res.status(400);
      res.json({
          message: 'Authorization required'
        })
      }

  const findImage = await ReviewImage.findAll({
    where: {reviewId: reviewId}
  })
  let imageArr = []
  findImage.forEach(image => {
    imageArr.push(image.toJSON())
  })
  console.log(imageArr)
  if (imageArr.length >= 10) {
    res.status(400);
    return res.json({
      message: "Maximum number of images for this resource was reached",
      statusCode: 400
    })
  }

  const newImage = await ReviewImage.create({
    reviewId: reviewId,
    url
  })
  const payload = newImage.toJSON()
  if (payload) {
    delete payload.reviewId
    delete payload.createdAt
    delete payload.updatedAt
    console.log(payload)
    return res.json(payload)
  }
});


const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Review text is required"),
  check('stars')
    // .exists({ checkFalsy: true })
    // .notEmpty()
    .isInt({min: 1, max: 5})
    .withMessage("Stars must be an integer from 1 to 5"),

  handleValidationErrors
];

// EDIT a Review
router.put('/:reviewId', requireAuth, validateReview, async (req, res, next) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;

  const editReview = await Review.findByPk(reviewId);
  if (!editReview) {
    res.status(404);
   return  res.json({
      message: "Review couldn't be found",
      statusCode: 404
    })
  }
  let bookingObj = editReview.toJSON()
  if (bookingObj.userId !== req.user.id) {
      res.status(400);
      res.json({
          message: 'Authorization required'
        })
      }

  if (editReview) {
    editReview.update({

      review,
      stars,

    })
    return res.json(editReview)
  } else {
    const err = new Error('Invalid input');
    err.status = 400;
    err.title = 'Invalid Input';
    err.errors = ['Invalid'];
    return next(err)
  }
})


// DELETE A REVIEW
router.delete('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;

  const badReview = await Review.findByPk(reviewId);

  if (!badReview) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404
    })
  }

  let bookingObj = badReview.toJSON()
  if (bookingObj.userId !== req.user.id) {
      res.status(400);
      return res.json({
          message: 'Authorization required'
        })
      }

  if (badReview) {
    badReview.destroy();
    return res.json({
      message: "Successfully deleted",
      statusCode: 200
    })
  }
})

module.exports = router;
