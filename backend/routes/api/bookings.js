const express = require('express')
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { ResultWithContext } = require('express-validator/src/chain');



//MY CODE


// GET all of the Current User's Bookings
router.get('/current', requireAuth, async (req, res) => {
  const { user } = req;

  const userBookings = await Booking.findAll({
    where: { userId: user.id },
    include: [
      {
        model: Spot,
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'description'
          ]
        },
        include: [{ model: SpotImage }]
      }
    ]
  })
  let bookingList = [];
  userBookings.forEach(booking => {
    bookingList.push(booking.toJSON())
  })
  //  console.log(reviewList)
  bookingList.forEach(booking => {
    let spotImageArr = booking.Spot.SpotImages

    for (let el of spotImageArr) {
      if (el.preview === true) {
        booking.Spot.previewImage = el.url
      }
      if (!el.preview) {
        el.previewImage = 'no preview image found'
      }
      delete booking.Spot.SpotImages
    }
  })
  return res.json({ 'Bookings': bookingList })
});


// EDIT a Booking
router.put('/:bookingId', requireAuth, async (req, res) => {
  const { spot } = req;
  const { bookingId } = req.params;
  const { startDate, endDate } = req.body;


  const editBooking = await Booking.findByPk(bookingId);

  if (!editBooking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
      statusCode: 404
    })
  }
  let bookingObject = editBooking.toJSON()
  if (bookingObject.userId !== req.user.id) {
      res.status(400);
      res.json({
          message: 'Authorization required'
        })
      }

  // let bookingObj = editBooking.toJSON()
  let today = new Date()


  if (endDate <= startDate) {
    res.status(400);
    return res.json({
      message: "Validation error",
      statusCode: 400,
      errors: {
        endDate: "endDate cannot be on or before startDate"
      }
    })
  };

  if (endDate < today.toJSON()) {
    res.status(403);
    return res.json({
      message: "Past bookings can't be modified",
      statusCode: 403
    })
  }

  // console.log(editBooking)
  let bookingObj = editBooking.toJSON()
  // console.log(bookingObj)

  const allBookings = await Booking.findAll({
    where: { spotId: bookingObj.spotId }
  })
  // console.log(allBookings)
  let bookingArr = []
  allBookings.forEach(booking => {
    bookingArr.push(booking.toJSON())
  })
  // console.log(bookingArr)
  // console.log(new Date (startDate))

  let newStartDate = new Date(startDate)
  let newEndDate = new Date(endDate)


  for (let booking of bookingArr) {
    // console.log(booking.endDate)
    if (newStartDate === booking.startDate ||
      newStartDate === booking.endDate ||
      (newStartDate >= booking.startDate && newStartDate <= booking.endDate)) {
      res.status(403);
      res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
        }
      })
    }
    if (newEndDate === booking.endDate ||
      newEndDate === booking.startDate ||
      (newEndDate >= booking.startDate && newEndDate <= booking.endDate)) {
      res.status(403);
      return res.json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          endDate: "End date conflicts with an existing booking",
        }
      })
    }
  }

  if (editBooking) {
    editBooking.update({
      startDate,
      endDate
    })
    return res.json(editBooking)
  }
})


// DELETE A Booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;

  const badBooking = await Booking.findByPk(bookingId);


  if (!badBooking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
      statusCode: 404
    })
  }

  let bookingObj = badBooking.toJSON()
  console.log(bookingObj)
  if (bookingObj.userId !== req.user.id) {
      res.status(400);
      res.json({
          message: 'Authorization required'
        })
      }

  const allBookings = await Booking.findAll({
    where: { spotId: bookingObj.spotId }
  })

  let today = new Date()

    if (bookingObj.startDate === today ||
      bookingObj.endDate === today ||
      bookingObj.startDate >= today && bookingObj.endDate <= today) {
      res.status(403);
      return res.json({
        message: "Bookings that have been started can't be deleted",
        statusCode: 403
      })
  }
  if (badBooking) {
    badBooking.destroy();
    return res.json({
      message: "Successfully deleted",
      statusCode: 200
    })
  }

});


module.exports = router;



// let bookingObj = editBooking.toJSON()
// let today = new Date()
// console.log(bookingObj.endDate.getTime())
// console.log(bookingObj.startDate.getTime())
// console.log(today.getTime())



// if (bookingObj.endDate < bookingObj.startDate) {
//   res.status(400);
//   return res.json({
//     message: "Validation error",
//     statusCode: 400,
//     errors: {
//     endDate: "endDate cannot come before startDate"
//     }
//   })
// } else if (bookingObj.endDate < today) {
//   res.status(403);
//   res.json({
//     message: "Past bookings can't be modified",
//     statusCode: 403
//   })
// }





    //   if (bookingObj.endDate.getTime() < bookingObj.startDate.getTime()) {
    //     res.status(400);
    //     return res.json({
    //       message: "Validation error",
    //       statusCode: 400,
    //       errors: {
    //       endDate: "endDate cannot be on or before startDate"
    //       }
    //     })
    //   };
    //   let today = new Date();
    // //   console.log(today.getFullYear())
    // //   console.log(bookingObj.startDate)
    //   if (bookingObj.startDate.getFullYear() < today.getFullYear() || bookingObj.endDate.getFullYear() < today.getFullYear()) {
    //     res.status(403);
    //     return res.json({
    //         message: "Past bookings can't be modified",
    //         statusCode: 403
    //     })
    //   }
