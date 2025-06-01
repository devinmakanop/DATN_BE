const Restaurant = require('../models/restaurant');
const translate = require('google-translate-api-x');

// Hàm dịch 1 text
async function translateField(text, targetLang) {
    if (!text || typeof text !== 'string') return text;
    try {
        const res = await translate(text, { to: targetLang });
        return res.text;
    } catch (err) {
        console.error('Translate error:', err.message);
        return text;
    }
}

// Dịch toàn bộ nhà hàng (dùng cho getAll, getTop)
async function translateRestaurant(restaurant, targetLang) {
    return {
        ...restaurant,
        name: await translateField(restaurant.name, targetLang),
        cuisine: await translateField(restaurant.cuisine, targetLang),
        description: await translateField(restaurant.description, targetLang),
        address: await translateField(restaurant.address, targetLang),
        reviews: await Promise.all(
            (restaurant.reviews || []).map(async (review) => ({
                ...review,
                comment: await translateField(review.comment, targetLang),
                user: await translateField(review.user, targetLang),
            }))
        )
    };
}

// Dịch comment (dùng cho getRestaurantComments)
async function translateComments(comments, targetLang) {
    return await Promise.all(
        (comments || []).map(async (comment) => ({
            ...comment,
            comment: await translateField(comment.comment, targetLang),
            user: await translateField(comment.user, targetLang),
        }))
    );
}

// Lấy toàn bộ nhà hàng, có dịch nếu có query lng và không phải vi
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find({}).lean();
        const targetLang = req.query.lng;

        if (!targetLang || targetLang === 'vi') {
            return res.json(restaurants);
        }

        const translatedRestaurants = await Promise.all(
            restaurants.map(r => translateRestaurant(r, targetLang))
        );

        res.json(translatedRestaurants);
    } catch (err) {
        console.error('Error in getAllRestaurants:', err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách nhà hàng' });
    }
};

// Tạo nhà hàng (không dịch)
const createRestaurant = async (req, res) => {
    try {
        const newRestaurant = new Restaurant(req.body);
        await newRestaurant.save();
        res.status(201).json(newRestaurant);
    } catch (err) {
        res.status(400).json({ error: 'Tạo nhà hàng thất bại' });
    }
};

// Lấy nhà hàng theo id, dịch nếu cần
const getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).lean();
        if (!restaurant) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(restaurant);
        }

        const translated = await translateRestaurant(restaurant, targetLang);
        res.json(translated);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// Cập nhật nhà hàng (không dịch)
const updateRestaurant = async (req, res) => {
    try {
        const updated = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Cập nhật thất bại' });
    }
};

// Xoá nhà hàng (không dịch)
const deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xoá nhà hàng' });
    } catch (err) {
        res.status(500).json({ error: 'Xoá thất bại' });
    }
};

// Lấy bình luận nhà hàng theo id, dịch nếu cần
const getRestaurantComments = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id).select('reviews').lean();
        if (!restaurant) return res.status(404).json({ error: 'Không tìm thấy nhà hàng' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(restaurant.reviews);
        }

        const translatedComments = await translateComments(restaurant.reviews, targetLang);
        res.json(translatedComments);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi lấy bình luận nhà hàng' });
    }
};

// Lấy top nhà hàng, dịch nếu cần
const getTopRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find().sort({ likeCount: -1 }).lean();
        const targetLang = req.query.lng;

        if (!targetLang || targetLang === 'vi') {
            return res.json(restaurants);
        }

        const translatedRestaurants = await Promise.all(
            restaurants.map(r => translateRestaurant(r, targetLang))
        );

        res.json(translatedRestaurants);
    } catch (err) {
        console.error('❌ Error fetching top restaurants:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllRestaurants,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantComments,
    getTopRestaurants
};
