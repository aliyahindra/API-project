const express = require('express')
const { Spot, User, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');




// DELETE review Image
router.delete('/:imageId', requireAuth, async (req, res) => {
    const { imageId } = req.params;
    const { user } = req;

    const deleteImage = await ReviewImage.findByPk(imageId);

    if (!deleteImage) {
        res.status(404);
        res.json({
            message: "Review Image couldn't be found",
            statusCode: 404
        })
    }
    let imageObj = deleteImage.toJSON()

    const userReviews = await Review.findByPk(imageObj.reviewId);
    let reviewObj = userReviews.toJSON()

    if (reviewObj.userId !== user.id) {
        res.status(400);
        return res.json({
            message: 'Authorization Required'
        })
    }

    if (deleteImage) {
        deleteImage.destroy();
        res.json({
            message: "Successfully deleted",
            statusCode: 200
        })
    }
});


module.exports = router;
