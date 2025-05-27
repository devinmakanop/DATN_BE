const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    name: String,
    address: String,
    phone: String,
    images: [String],
    description: String,
    rating: Number,
    likeCount: { type: Number, default: 0 },    
    dislikeCount: { type: Number, default: 0 },
    comments: [
        {
            user: String,
            comment: String
        }
    ]
});

module.exports = mongoose.models.Accommodation || mongoose.model('Accommodation', accommodationSchema);
