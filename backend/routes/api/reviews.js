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

    // const spots = await Spot.findAll({
    //     where: { ownerId: user.id },
    //     include: [{
    //         model: SpotImage,
    //     }]
    // })

    // let spotsList = [];
    // spots.forEach(spot => {
    //   spotsList.push(spot.toJSON())
    // })
    // //    console.log(spotsList)
    // spotsList.forEach(spot => {
    //   spot.SpotImages.forEach(image => {
    //     // console.log(image)
    //     if (image.preview === true) {
    //       // console.log(image.url)
    //       spot.previewImage = image.url
    //     }
    //   })
    //   if (!spot.preview) {
    //     spot.previewImage = 'no preview image found'
    //   }
    //   delete spot.SpotImages
    // })

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

    let reviewList = [];
    userReviews.forEach(review => {
      reviewList.push(review.toJSON())
    })
      //  console.log(reviewList)
    reviewList.forEach(review => {
    //  console.log(review.Spot.SpotImages)
     let spotImageArr = review.Spot.SpotImages
    //  console.log(spotImageArr[0].preview)
     for (let el of spotImageArr) {
      if (el.preview === true) {
        review.Spot.previewImage = el.url
      }
      if (!el.preview) {
        el.previewImage = 'no preview image found'
      }
      delete review.Spot.SpotImages
     }
    })


    // console.log(userReviews)
    res.json({'Reviews': reviewList})
})


// ADD an Image to a Review based on the Revies id
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

  const findImage = await ReviewImage.findAll({
    where: {reviewId: reviewId}
  })
  let imageArr = []
  findImage.forEach(image => {
    imageArr.push(image.toJSON())
  })
  if (imageArr.length >= 10) {
    res.status(403);
    return res.json({
      message: "Maximum number of images for this resource was reached",
      statusCode: 403
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
    res.json({
      message: "Review couldn't be found",
      statusCode: 404
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

  if (badReview) {
    badReview.destroy();
    return res.json({
      message: "Successfully deleted",
      statusCode: 200
    })
  } else {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404
    })
  }
})

module.exports = router;
