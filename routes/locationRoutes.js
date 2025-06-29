const express = require('express');
const router = express.Router();
const {
    getAllLocations,
    createLocation,
    getLocationsByType,
    getLocationById,
    updateLocation,
    deleteLocation,
    getLocationComments,    
    getTopLocations
} = require('../controllers/locationController');

router.get('/top-liked', getTopLocations);

router.get('/', getAllLocations);
router.post('/', createLocation);
router.get('/type/:type', getLocationsByType);
router.get('/:id', getLocationById);
router.put('/:id', updateLocation);
router.delete('/:id', deleteLocation);
router.get('/:id/comments', getLocationComments);

module.exports = router;
