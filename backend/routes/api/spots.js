const express = require('express')
const { Spot, User, SpotImage, Review, ReviewImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();



// My routes

// GET all spots
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
   let spotsList =  [];
   spots.forEach(spot => {
       spotsList.push(spot.toJSON())
   })
//    console.log(spotsList)
   spotsList.forEach(spot => {
        spot.SpotImages.forEach(image => {
                // console.log(image)
                if (image.preview === true) {
                        // console.log(image.url)
                 spot.preview = image.url
                }
        })
        if (!spot.preview) {
                spot.preview = 'no preview image found'
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
                spot.stars = average

        })
        delete spot.Reviews
   })

   res.json({"Spots": spotsList})
});










//GET all spots
// router.get('/', async (req, res) => {
//         const spots = await Spot.findAll({
//         })
// return res.json({ "Spots": spots })
// })




//GET all Spots owned by the Current User
// need to check
// router.get('/current', requireAuth, async (req, res) => {
//     const userSpots = await Spot.findAll({
//         include: [
//             {model: User}
//         ],
//         where: { ownerId: req.user.id }
//     })
//     return res.json(userSpots)
// })

// GET detail of a spot from an id
// router.get('/:spotId', async (req, res) => {
//     const { spotId } = req.params;

//     const spot = await Spot.findAll({
//         include: [
//             {model: SpotImage},
//             {model: User}
//         ],
//         where: {spotId: spot.id}
//     })

//     return res.json(spot);
// })

module.exports = router;
