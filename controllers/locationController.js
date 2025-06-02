const Location = require('../models/location');
const translate = require('google-translate-api-x');

// Hàm dịch một trường text
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

// Dịch một địa danh đầy đủ
async function translateLocation(location, targetLang) {
    return {
        ...location,
        name: await translateField(location.name, targetLang),
        type: await translateField(location.type, targetLang),
        description: await translateField(location.description, targetLang),
        address: await translateField(location.address, targetLang),
        comments: await Promise.all(
            (location.comments || []).map(async c => ({
                ...c,
                user: await translateField(c.user, targetLang),
                comment: await translateField(c.comment, targetLang),
            }))
        )
    };
}

// Lấy tất cả địa danh, dịch nếu cần
const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.find().lean();
        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(locations);
        }

        const translatedLocations = await Promise.all(
            locations.map(loc => translateLocation(loc, targetLang))
        );
        res.json(translatedLocations);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server khi lấy địa danh' });
    }
};

// Tạo mới địa danh (không dịch)
const createLocation = async (req, res) => {
    try {
        const newLocation = new Location(req.body);
        await newLocation.save();
        res.status(201).json(newLocation);
    } catch (err) {
        res.status(400).json({ error: 'Tạo địa danh thất bại' });
    }
};

// Lọc theo loại (dịch type nếu cần)
const getLocationsByType = async (req, res) => {
    try {
        const { type } = req.params;
        const targetLang = req.query.lng;
        let queryType = type;
        if (targetLang && targetLang !== 'vi') {
            // Nếu có yêu cầu dịch, không thể lọc bằng text tiếng vi trực tiếp
            // Thường nên lọc kiểu khác hoặc trả về hết rồi lọc phía client
            // Ở đây trả về hết để client lọc, hoặc bạn có thể map dịch ngược type
            return res.status(400).json({ error: 'Lọc theo loại khi dịch không hỗ trợ' });
        }

        const results = await Location.find({ type: queryType }).lean();

        if (!targetLang || targetLang === 'vi') {
            return res.json(results);
        }

        const translatedResults = await Promise.all(
            results.map(loc => translateLocation(loc, targetLang))
        );
        res.json(translatedResults);

    } catch (err) {
        res.status(500).json({ error: 'Không lọc được loại địa danh' });
    }
};

// Lấy địa danh theo ID, dịch nếu cần
const getLocationById = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id).lean();
        if (!location) return res.status(404).json({ error: 'Không tìm thấy' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(location);
        }

        const translated = await translateLocation(location, targetLang);
        res.json(translated);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi tìm địa danh' });
    }
};

// Cập nhật (không dịch)
const updateLocation = async (req, res) => {
    try {
        const updated = await Location.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Cập nhật thất bại' });
    }
};

// Xóa (không dịch)
const deleteLocation = async (req, res) => {
    try {
        await Location.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xoá địa danh' });
    } catch (err) {
        res.status(500).json({ error: 'Xoá thất bại' });
    }
};

// Lấy bình luận, dịch nếu cần
const getLocationComments = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id).lean().select('comments');
        if (!location) return res.status(404).json({ error: 'Không tìm thấy địa điểm' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(location.comments);
        }

        const translatedComments = await Promise.all(
            (location.comments || []).map(async c => ({
                ...c,
                user: await translateField(c.user, targetLang),
                comment: await translateField(c.comment, targetLang),
            }))
        );

        res.json(translatedComments);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy bình luận địa điểm' });
    }
};

// Lấy địa danh được thích nhiều nhất, dịch nếu cần
const getTopLocations = async (req, res) => {
    try {
       const locations = await Location.find({ likeCount: { $exists: true } }).sort({ likeCount: -1 }).lean();

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(locations);
        }

        const translatedLocations = await Promise.all(
            locations.map(loc => translateLocation(loc, targetLang))
        );

        res.json(translatedLocations);
    } catch (err) {
        console.error('❌ Error fetching top locations:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllLocations,
    createLocation,
    getLocationsByType,
    getLocationById,
    updateLocation,
    deleteLocation,
    getLocationComments,
    getTopLocations
};
