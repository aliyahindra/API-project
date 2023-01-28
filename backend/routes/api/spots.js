const express = require('express')
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');



// My routes

//// GET all spots ////
router.get('/', async (req, res) => {
  const spots = await Spot.findAll({
    include: [
      {
        model: Review,
      },
      {
        model: SpotImage
      }
    ]
  })
  //    console.log(spots)
  let spotsList = [];
  spots.forEach(spot => {
    spotsList.push(spot.toJSON())
  })
  //    console.log(spotsList)
  spotsList.forEach(spot => {
    spot.SpotImages.forEach(image => {
      // console.log(image)
      if (image.preview === true) {
        // console.log(image.url)
        spot.previewImage = image.url
      }
    })
    if (!spot.preview) {
      spot.previewImage = 'no preview image found'
    }
    delete spot.SpotImages
  })

  spotsList.forEach(spot => {
    spot.Reviews.forEach(review => {
      let starRatings = []
      let sum = 0
      // console.log(review.stars)
      starRatings.push(review.stars)
      for (let star of starRatings) {
        console.log(star)
        sum += star
      }
      let average = sum / starRatings.length
      spot.avgRating = average

    })
    delete spot.Reviews
  })

  res.json({ "Spots": spotsList })
});


//// GET all Spots owned by Current USer  ////
router.get('/current', requireAuth, async (req, res, next) => {
  const { user } = req
  const userSpots = await Spot.findAll({
    where: { ownerId: user.id },
    include: [
      {
        model: Review,
      },
      {
        model: SpotImage
      }
    ]
  })
  // console.log(userSpots)
  let spotsList = [];
  userSpots.forEach(spot => {
    spotsList.push(spot.toJSON())
  })
  //    console.log(spotsList)
  spotsList.forEach(spot => {
    spot.SpotImages.forEach(image => {
      // console.log(image)
      if (image.preview === true) {
        // console.log(image.url)
        spot.previewImage = image.url
      }
    })
    delete spot.SpotImages
  })

  spotsList.forEach(spot => {
    spot.Reviews.forEach(review => {
      let starRatings = []
      let sum = 0
      // console.log(review.stars)
      starRatings.push(review.stars)
      for (let star of starRatings) {
        console.log(star)
        sum += star
      }
      let average = sum / starRatings.length
      spot.avgRating = average

    })
    delete spot.Reviews
  })

  return res.json({ 'Spots': spotsList })
})

////  GET details of a Spot from an id ////
router.get('/:spotId', async (req, res, next) => {
  const { spotId } = req.params;
  // const spotId = req.params.id

  const spotById = await Spot.findAll({
    where: { id: spotId },
    include: [
      {
        model: Review
      },
      {
        model: SpotImage,
        attributes: [
          'id',
          'url',
          'preview'
        ]
      },
      {
        model: User,
        attributes: [
          'id',
          'firstName',
          'lastName'
        ]
      },
    ]
  })
  // console.log(spotById)

  let spotList = [];
  // spots.forEach(spot => {
  //         spotsList.push(spot.toJSON())
  // })
  for (let spot of spotById) {
    spotList.push(spot.toJSON())
  }

  spotList.forEach(spot => {
    spot.Reviews.forEach(review => {
      let ratings = []
      let sum = 0
      // console.log(review.stars)
      ratings.push(review.stars)
      for (let star of ratings) {
        console.log(star)
        sum += star
      }
      spot.numReviews = ratings.length
      spot.avgStarRating = sum / ratings.length
    })
    delete spot.Reviews
  })
  if (!spotById.length) {
    //      const err = new Error("Spot couldn't be found")
    //      err.status = 404
    //      next(err)
    res.status(404)
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  } else {
    return res.json(spotList[0])
  }
});

const validateSpot = [
  check('address')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Street address is required"),
  check('city')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("City is required"),
  check('state')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("State is required"),
  check('country')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Country is required"),
  check('lat')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Latitude is not valid"),
  check('lng')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Longitude is not valid"),
  check('name')
    .exists({ len: [1, 50] })
    .notEmpty()
    .withMessage("Name must be less than 50 characters"),
  check('description')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Description is required"),
  check('price')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Price per day is required"),

  handleValidationErrors
];
// CREATE a Spot
router.post('/', requireAuth, validateSpot, async (req, res) => {
  const { user } = req
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  const addSpot = await Spot.create({
    ownerId: user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price
  })

  if (!addSpot) {
    const err = new Error('Invalid input');
    err.status = 400;
    err.title = 'Invalid Input';
    err.errors = ['Invalid'];
    return next(err)
  }

  if (addSpot) {
    return res.json(addSpot)
  }

});

// ADD an Image to a Spot based on the SPot's id
router.post('/:spotId/images', requireAuth, async (req, res) => {
  const { user } = req;
  const { spotId } = req.params;
  const { url, preview } = req.body;

  const findSpot = await Spot.findByPk(spotId);
  if (!findSpot) {
    res.status(404)
    res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }

  const spot = await SpotImage.create({
    where: { spotId: spotId },
    url,
    preview
  })
  const payload = spot.toJSON()
  if (payload) {
    delete payload.createdAt
    delete payload.updatedAt
    console.log(payload)
    return res.json(payload)
  }
});


// EDIT a Spot
router.put('/:spotId', requireAuth, validateSpot, async (req, res, next) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  const editSpot = await Spot.findByPk(spotId);
  if (!editSpot) {
    res.status(404);
    res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }

  if (editSpot) {
    editSpot.update({
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price
    })
    return res.json(editSpot)
  } else {
    const err = new Error('Invalid input');
    err.status = 400;
    err.title = 'Invalid Input';
    err.errors = ['Invalid'];
    return next(err)
  }
})

// DELETE a Spot
router.delete('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;

  const badSpot = await Spot.findByPk(spotId);

  if (badSpot) {
    badSpot.destroy();
    return res.json({
      message: "Successfully deleted",
      statusCode: 200
    })
  } else {
    res.status(404)
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }
})

//GET all Reviews by Spot id
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId }  = req.params;
  const { user } = req;

  const spotReviews = await Review.findAll({
    where: {spotId: spotId},
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
        model: ReviewImage,
        attributes: [
          'id',
          'url'
        ]
      }
    ]
  })
  if (spotReviews.length) {
    res.json({'Reviews': spotReviews})
  } else {
    res.status(404);
    res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }
})
const validateReview = [
  check('review')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Review text is required"),
  check('stars')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Stars must be an integer from 1 to 5"),

  handleValidationErrors
];
// CREATE a Review for a Spot based on the Spot's id
router.post('/:spotId/reviews', requireAuth, validateReview, async (req, res) => {
    const { spotId } = req.params;
    const { spot } = req
    const { user } = req
    const { review, stars } = req.body;

    const findSpot = await Spot.findByPk(spotId);
  if (!findSpot) {
    res.status(404);
    res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }

  const userReview = await Review.findAll({
    where: {userId: user.id}
  });
  if (userReview) {
    res.status(403);
    res.json({
      message: "User already has a review for this spot",
       statusCode: 403
    })
  }

    const newReview = await Review.create({
      spotId: spotId,
      review,
      stars
    })
    if (!newReview) {
      const err = new Error('Invalid input');
      err.status = 400;
      err.title = 'Invalid Input';
      err.errors = ['Invalid'];
      return next(err)
    }

    if (newReview) {
      return res.json(newReview)
    }
});

// GET all Bookings for a Spot based on the Spot's id
router.get('/:spotId/bookings', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req

  const findBookings = await Booking.findAll({
    where: {spotId: spotId},
    include: [
      {
        model: User,
        attributes: [
          'id',
          'firstName',
          'lastName'
        ]
      }
    ]
  })

  let resArr = [];
  findBookings.forEach(booking => {
    resArr.push(booking.toJSON())
  })
  if (!resArr.length) {
    res.status(404);
    res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }
  // console.log(resArr)

  for (let booking of resArr) {
    if (booking.userId === user.id) {
      return res.json(resArr)
    } else {
      delete booking.User
      return res.json(resArr)
    }
  }
});




module.exports = router;
