    const mongoose = require('mongoose');

    const travelAgencySchema = new mongoose.Schema({
        name: { type: String, required: true },
        address: String,
        phone: String,
        email: String,
        website: String,
        description: String,
        services: [String],
        imageUrl: { type: String },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number },
        },
        likeCount: { type: Number, default: 0 },
        dislikeCount: { type: Number, default: 0 },
        comments: [
            {
                user: String,
                comment: String,
                createdAt: { type: Date, default: Date.now }
            }
        ]
    }, { timestamps: true });

    travelAgencySchema.index({ location: '2dsphere' });

    module.exports = mongoose.model('TravelAgency', travelAgencySchema);
