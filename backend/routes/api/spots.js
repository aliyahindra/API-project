const express = require('express')
const { Spot, User, SpotImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();



// My routes

//GET all spots
router.get('/', async (req, res) => {
    const spots = await Spot.findAll();

    return res.json({"Spots": spots})
});

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
