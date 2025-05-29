const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant');
const Location = require('../models/location');

exports.addComment = async (req, res) => {
    const { type, refId } = req.params;
    const { user, comment } = req.body;

    try {
        // Kiểm tra ID hợp lệ
        if (!mongoose.Types.ObjectId.isValid(refId)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Kiểm tra thông tin người dùng
        if (!user || typeof user !== 'string' || user.trim() === '') {
            return res.status(400).json({ message: 'Thông tin người dùng không hợp lệ hoặc thiếu' });
        }

        // Xác định loại model
        let Model;
        if (type === 'restaurant') Model = Restaurant;
        else if (type === 'location') Model = Location;
        else return res.status(400).json({ message: 'Invalid type' });

        // Tìm đối tượng theo ID
        const item = await Model.findById(refId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Thêm bình luận
        if (!item.comments) item.comments = [];
        item.comments.push({ user, comment });

        await item.save();
        res.json({ message: 'Comment added', comments: item.comments });

    } catch (err) {
        console.error('❌ Comment error:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

