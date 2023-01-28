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
                attributes: { exclude: [
                    'createdAt',
                    'updatedAt',
                    'description'
                ]},
                include: [{model: SpotImage}]
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
    res.json({'Bookings': bookingList})
});






// CREATE a Booking from a spot based on the spot's id



// EDIT a Booking



// DELETE A Booking













module.exports = router;
