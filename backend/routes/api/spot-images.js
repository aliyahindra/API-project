
const express = require('express')
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { ResultWithContext } = require('express-validator/src/chain');



// MY CODE

// DELETE a Spot Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const { user } = req

    const badImage = await SpotImage.findByPk(imageId);
    if (!badImage) {
        res.status(404);
        return res.json({
            message: "Spot Image couldn't be found",
            statusCode: 404
        })
    }

    let imageObj = badImage.toJSON()

    const userSpots = await Spot.findByPk(imageObj.spotId);
    let spotObj = userSpots.toJSON()

    if (spotObj.ownerId !== user.id) {
        res.status(400);
        return res.json({
            message: 'Authorization Required'
        })
    }

    if (badImage) {
        badImage.destroy();
        return res.json({
            message: "Successfully deleted",
           statusCode: 200
        })
    }
})








module.exports = router;
