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




// CREATE a Review for a Spot based on the Spot's id



// ADD an Image to a Review based on the Revies id



// EDIT a Review



// DELETE A REVIEW


module.exports = router;
