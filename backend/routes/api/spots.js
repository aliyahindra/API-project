const express = require('express')
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { response } = require('express');
const { Op } = require('sequelize');


// My routes
// const validateQueryError = [
//   check('page')
//   .exists({ checkFalsey: true})
//   .isInt({min: 1})
//   .withMessage("Page must be greater than or equal to 1"),
//   check('size')
//   .exists({checkFalsey: true})
//   .isInt({min: 1})
//   .withMessage('Size must be greater than or equal to 1'),
//   // check('maxPrice')
//   // .exists({checkFalsey: true}),

//   handleValidationErrors

// ]

//// GET all spots ////
router.get('/', async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;

  const pagination = {};
  let query = {
    where: {},
  }

  page = parseInt(page);
  size = parseInt(size);

  if (Number.isNaN(page) || page < 1) page = 1
  if (Number.isNaN(size) || size < 1) size = 20;
  if (page > 10) page = 10
  if (size > 20) size = 20;

  pagination.limit = size;
  pagination.offset = (page - 1) * size

  maxPrice = parseInt(maxPrice);
  minPrice = parseInt(minPrice);
  maxLat = parseInt(maxLat);
  minLat = parseInt(minLat);
  maxLng = parseInt(maxLng);
  minLng = parseInt(minLng);

  if (maxLat) {
    query.where.lat = {
      [Op.lte]: maxLat
    }
  };
  if (minLat)
    query.where.lat = {
      [Op.gte]: minLat

    };
  if (maxLat && minLat)
    query.where.lat = {
      [Op.between]: [minLat, maxLat]

    };

  if (maxLng)
    query.where.lat = {
      [Op.lte]: maxLng
    };
  if (minLng)
    query.where.lat = {
      [Op.gte]: minLng

    };
  if (maxLng && minLng)
    query.where.lat = {
      [Op.between]: [minLat, maxLat]

    };
  if (maxPrice)
    query.where.price = {
      [Op.lte]: maxPrice

    };
  if (minPrice)
    query.where.price = {
      [Op.gte]: minPrice

    };
  if (maxPrice && minPrice)
    query.where.price = {
      [Op.between]: [minPrice, maxPrice]

    };

  ///GET SPOTs
  const spots = await Spot.findAll({
    query,
    include: [
      {
        model: Review,
      },
      {
        model: SpotImage
      }
    ],
    ...pagination
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


  return res.json({ "Spots": spotsList, page, size })
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
  //  console.log(spotsList)
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
        // console.log(star)
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
        as: 'Owner',
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
        // console.log(star)
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
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }
  const spotObj = findSpot.toJSON()
  // console.log(spotObj.ownerId)
  // console.log(user.id)
  if (spotObj.ownerId !== user.id) {
    res.status(400)
    return res.json({
      message: 'Authorization Required'
    })
  }


  // console.log(user.id)
  // if (Spot.spotId !== user.id) {
  //   res.status(400);
  //   res.json({
  //     message: 'Authorization Required'
  //   })
  // }


  const spot = await SpotImage.create({
    where: { spotId: spotId },
    url,
    preview
  })
  const payload = spot.toJSON()
  if (payload) {
    delete payload.createdAt
    delete payload.updatedAt
    // console.log(payload)
    return res.json(payload)
  }
});


// EDIT a Spot
router.put('/:spotId', requireAuth, validateSpot, async (req, res, next) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const { user } = req

  const editSpot = await Spot.findByPk(spotId);
  if (!editSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }
  const spotObj = editSpot.toJSON()
  if (spotObj.ownerId !== user.id) {
    res.status(400)
    return res.json({
      message: 'Authorization Required'
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
  const { user } = req;

  const badSpot = await Spot.findByPk(spotId);

  if (!badSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }

  const spotObj = badSpot.toJSON()
  if (spotObj.ownerId !== user.id) {
    res.status(400)
    return res.json({
      message: 'Authorization Required'
    })
  }

  if (badSpot) {
    badSpot.destroy();
    return res.json({
      message: "Successfully deleted",
      statusCode: 200
    })
  }
});

//GET all Reviews by Spot id
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;

  const spotReviews = await Review.findAll({
    where: { spotId: spotId },
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
    res.json({ 'Reviews': spotReviews })
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
  const { review, stars, id, userId, createdAt, updatedAt } = req.body;

  const findSpot = await Spot.findByPk(spotId);
  if (!findSpot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }

  const userReview = await Review.findAll({
    where: { userId: user.id }
  });
  if (userReview) {
    res.status(403);
    res.json({
      message: "User already has a review for this spot",
      statusCode: 403
    })
  }

  const newReview = await Review.create({
    where: { spotId: spotId },
    id,
    userId: user.id,
    spotId,
    review,
    stars,
    createdAt,
    updatedAt
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
    where: { spotId: spotId },
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
      return res.json({ "Bookings": resArr })
    }
  }

  const bookings = await Booking.findAll({
    where: { spotId: spotId },
    attributes: [
      'spotId',
      'startDate',
      'endDate'
    ]
  })

  let bookArr = []
  bookings.forEach(booking => {
    bookArr.push(booking.toJSON())
    if (!bookArr.length) {
      res.status(404)
      res.json({
        message: "Spot couldn't be found",
        statusCode: 404
      })
    }
  })
  for (let booking of resArr) {
    if (booking.userId !== user.id) {
      return res.json({ "Bookings": bookArr })
    }
  }
});



// CREATE a Booking from a spot based on the spot's id
router.post('/:spotId/bookings', requireAuth, async (req, res, next) => {
  const { spotId } = req.params;
  const { user } = req;
  const { userId, startDate, endDate } = req.body;

  const findSpot = await Spot.findByPk(spotId);
  if (!findSpot) {
    res.status(404);
    res.json({
      message: "Spot couldn't be found",
      statusCode: 404
    })
  }

  let spotObject = findSpot.toJSON()
  if (spotObject.ownerId === req.user.id) {
    res.status(400);
    return res.json({
      message: 'Owner is Not Authorized'
    })
  }

  const findBookings = await Booking.findAll({
    where: { spotId: spotId }
  })

  let allSpotBookings = []
  findBookings.forEach(bookings => {
    allSpotBookings.push(bookings.toJSON())
  })

  const newBooking = await Booking.create({
    spotId,
    userId: spotId,
    startDate,
    endDate
  })

  //   console.log(newBooking)

  let bookingObj = newBooking.toJSON()
  // console.log(bookingObj)

  for (let booking of allSpotBookings) {

    if (bookingObj.startDate === booking.startDate ||
      bookingObj.startDate === booking.endDate ||
      bookingObj.startDate >= booking.startDate && bookingObj.startDate <= booking.endDate) {
      res.status(403)
      res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
        }
      })
    }
    if (bookingObj.endDate === booking.startDate ||
      bookingObj.endtDate === booking.endDate ||
      bookingObj.endDate >= booking.startDate && bookingObj.endDate <= booking.endDate) {
      res.status(403)
      res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "End date conflicts with an existing booking",
        }
      })
    }
  }

  if (bookingObj.endDate < bookingObj.startDate) {
    res.status(400);
    return res.json({
      message: "Validation error",
      statusCode: 400,
      errors: {
        endDate: "endDate cannot be on or before startDate"
      }
    })
  }

  return res.json(bookingObj)

})




module.exports = router;





// if (req.query.minLat) {
//   if (!isNAN(minLat)) {
//     query.where.minLat = parseInt(minLat)
//   }
// } else {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors: {
//       minLat: "Minimum latitude is invalid",
//     }
//   })
// }
// if (maxLat) {
//   if (!isNAN(minLat)) {
//     where.maxLat = parseInt(maxLat)
//   }
// } else {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors: {
//       minLat: "Maximum latitude is invalid",
//     }
//   })
// }
// if (minLng) {
//   if (!isNAN(minLng)) {
//     where.minLng = parseInt(minLng)
//   }
// } else {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors: {
//       minLat: "Minimum longitude is invalid",
//     }
//   })
// }
// if (maxLng) {
//   if (!isNAN(maxLng)) {
//     where.maxLng = parseInt(maxLng)
//   }
// } else {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors: {
//       minLat: "Maximum longitude is invalid",
//     }
//   })
// }
// if (minPrice) {
//   if (!isNAN(minPrice) && minPrice >= 0) {
//     where.minPrice = parseInt(minPrice)
//   }
// } else {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors: {
//       minLat: "Minimum price must be greater than or equal to 0",
//     }
//   })
// }
// if (maxPrice) {
//   if (!isNAN(maxPrice) && maxPrice >= 0) {
//     where.macPrice = parseInt(maxPrice)
//   }
// } else {
//   res.status(400);
//   res.json({
//     message: "Validation Error",
//     statusCode: 400,
//     errors: {
//       minLat: "Maximum price must be greater than or equal to 0",
//     }
//   })
// }


// const minLat = req.query.minLat ? req.query.minLat : null
// const maxLat = req.query.maxLat ? req.query.maxLat : null
// const minLng = req.query.minLng ? req.query.minLng : null
// const maxLng = req.query.maxLng ? req.query.maxLng : null
// const minPrice = req.query.minPrice ? req.query.minPrice : null
// const maxPrice = req.query.maxPrice ? req.query.maxPrice : null


// // Query filters
// if (maxLat && !minLat) {
// query.where.lat = {
//   [Op.lte]: maxLat
// }
// };
// if (!maxLat && minLat) {
// query.where.lat = {
//   [Op.gte]: minLat
// }
// }
// if (maxLat && minLat) {
// query.where.lat = {
//   [Op.and]: {
//     [Op.lte]: maxLat,
//     [Op.gte]: minLat,
//   }
// }
// }
// if (maxLng && !minLng) {
// query.where.lat = {
//   [Op.lte]: maxLat
// }
// };
// if (!maxLng && minLng) {
// query.where.lat = {
//   [Op.gte]: minLat
// }
// }
// if (maxLng && minLng) {
// query.where.lat = {
//   [Op.and]: {
//     [Op.lte]: maxLat,
//     [Op.gte]: minLat,
//   }
// }
// }
// if (minPrice && maxPrice) {
// query.where.price = {
//   [Op.between]: [minPrice, maxPrice]
// }
// }



// if (minLat) {
//   if (Number.isInteger(minLat)) {
//     query.where.lat = parseInt(minLat)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Minimum latitude is invalid",
//       }
//     })
//   }
// }
// if (maxLat) {
//   if (Number.isInteger(maxLat)) {
//     where.maxLat = parseInt(maxLat)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Maximum latitude is invalid",
//       }
//     })
//   }
// }
// if (minLng) {
//   if (Number.isInteger(minLng)) {
//     where.minLng = parseInt(minLng)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Minimum longitude is invalid",
//       }
//     })
//   }
// }
// if (maxLng) {
//   if (Number.isInteger(maxLng)) {
//     where.maxLng = parseInt(maxLng)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Maximum longitude is invalid",
//       }
//     })
//   }
// }
// if (minPrice) {
//   if (Number.isInteger(minPrice) && minPrice >= 0) {
//     where.minPrice = parseInt(price)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Minimum price must be greater than or equal to 0",
//       }
//     })
//   }
// }
// if (maxPrice) {
//   if (maxPrice >= 0) {
//     query.where.price = parseInt(Spot.price <= maxPrice)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Maximum price must be greater than or equal to 0",
//       }
//     })
//   }
// }



// if (minLat) {
//   if (Number.isInteger(minLat)) {
//     query.where.lat = parseInt(minLat)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Minimum latitude is invalid",
//       }
//     })
//   }
// }
// if (maxLat) {
//   if (Number.isInteger(maxLat)) {
//     where.maxLat = parseInt(maxLat)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Maximum latitude is invalid",
//       }
//     })
//   }
// }
// if (minLng) {
//   if (Number.isInteger(minLng)) {
//     where.minLng = parseInt(minLng)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Minimum longitude is invalid",
//       }
//     })
//   }
// }
// if (maxLng) {
//   if (Number.isInteger(maxLng)) {
//     where.maxLng = parseInt(maxLng)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Maximum longitude is invalid",
//       }
//     })
//   }
// }
// if (minPrice) {
//   if (Number.isInteger(minPrice) && minPrice >= 0) {
//     where.minPrice = parseInt(price)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Minimum price must be greater than or equal to 0",
//       }
//     })
//   }
// }
// if (maxPrice) {
//   if (maxPrice >= 0) {
//     query.where.price = parseInt(Spot.price <= maxPrice)
//   } else {
//     res.status(400);
//     res.json({
//       message: "Validation Error",
//       statusCode: 400,
//       errors: {
//         minLat: "Maximum price must be greater than or equal to 0",
//       }
//     })
//   }
// }
