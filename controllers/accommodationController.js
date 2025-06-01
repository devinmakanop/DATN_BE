const Accommodation = require('../models/Accommodation');
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

// Dịch toàn bộ accommodation
async function translateAccommodation(item, targetLang) {
    return {
        ...item,
        name: await translateField(item.name, targetLang),
        address: await translateField(item.address, targetLang),
        description: await translateField(item.description, targetLang),
        // giữ nguyên phone, images, rating, likeCount, dislikeCount
        phone: item.phone,
        images: item.images,
        rating: item.rating,
        likeCount: item.likeCount,
        dislikeCount: item.dislikeCount,
        comments: await Promise.all(
            (item.comments || []).map(async (comment) => ({
                ...comment,
                user: await translateField(comment.user, targetLang),
                comment: await translateField(comment.comment, targetLang),
            }))
        )
    };
}

// GET all, dịch nếu có query lng khác vi
exports.getAll = async (req, res) => {
    try {
        const data = await Accommodation.find().lean();
        const targetLang = req.query.lng;

        if (!targetLang || targetLang === 'vi') {
            return res.json(data);
        }

        const translatedData = await Promise.all(
            data.map(item => translateAccommodation(item, targetLang))
        );

        res.json(translatedData);
    } catch (err) {
        console.error('Error in getAll:', err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách chỗ ở' });
    }
};

// CREATE (không dịch)
exports.create = async (req, res) => {
    try {
        const newItem = new Accommodation(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (err) {
        res.status(400).json({ error: 'Tạo chỗ ở thất bại' });
    }
};

// GET by ID, dịch nếu cần
exports.getById = async (req, res) => {
    try {
        const item = await Accommodation.findById(req.params.id).lean();
        if (!item) return res.status(404).json({ error: 'Không tìm thấy chỗ ở' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(item);
        }

        const translated = await translateAccommodation(item, targetLang);
        res.json(translated);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};

// UPDATE (không dịch)
exports.update = async (req, res) => {
    try {
        const updated = await Accommodation.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: 'Cập nhật thất bại' });
    }
};

// DELETE (không dịch)
exports.delete = async (req, res) => {
    try {
        await Accommodation.findByIdAndDelete(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: 'Xoá thất bại' });
    }
};
