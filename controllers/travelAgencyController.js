const TravelAgency = require('../models/travelAgency');
const translate = require('google-translate-api-x');

// Hàm dịch 1 trường text
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

// Dịch toàn bộ công ty lữ hành (dịch cả mảng services và comments)
async function translateAgency(agency, targetLang) {
    return {
        ...agency,
        name: await translateField(agency.name, targetLang),
        address: await translateField(agency.address, targetLang),
        description: await translateField(agency.description, targetLang),
        services: await Promise.all(
            (agency.services || []).map(s => translateField(s, targetLang))
        ),
        comments: await Promise.all(
            (agency.comments || []).map(async c => ({
                ...c,
                comment: await translateField(c.comment, targetLang),
                user: await translateField(c.user, targetLang),
                createdAt: c.createdAt
            }))
        )
    };
}

// Lấy tất cả công ty lữ hành, dịch nếu có query lng và khác 'vi'
exports.getAllAgencies = async (req, res) => {
    try {
        const agencies = await TravelAgency.find().lean();
        const targetLang = req.query.lng;

        if (!targetLang || targetLang === 'vi') {
            return res.json(agencies);
        }

        const translatedAgencies = await Promise.all(
            agencies.map(a => translateAgency(a, targetLang))
        );

        res.json(translatedAgencies);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách công ty lữ hành' });
    }
};

// Tạo công ty lữ hành (không dịch)
exports.createAgency = async (req, res) => {
    try {
        const newAgency = new TravelAgency(req.body);
        await newAgency.save();
        res.status(201).json(newAgency);
    } catch (error) {
        res.status(400).json({ error: 'Lỗi khi thêm công ty lữ hành' });
    }
};

// Lấy công ty lữ hành theo ID, dịch nếu cần
exports.getAgencyById = async (req, res) => {
    try {
        const agency = await TravelAgency.findById(req.params.id).lean();
        if (!agency) return res.status(404).json({ error: 'Không tìm thấy công ty lữ hành' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(agency);
        }

        const translated = await translateAgency(agency, targetLang);
        res.json(translated);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy thông tin công ty lữ hành' });
    }
};

// Cập nhật công ty lữ hành (không dịch)
exports.updateAgency = async (req, res) => {
    try {
        const updatedAgency = await TravelAgency.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedAgency);
    } catch (error) {
        res.status(400).json({ error: 'Lỗi khi cập nhật công ty lữ hành' });
    }
};

// Xóa công ty lữ hành (không dịch)
exports.deleteAgency = async (req, res) => {
    try {
        await TravelAgency.findByIdAndDelete(req.params.id);
        res.json({ message: 'Đã xóa công ty lữ hành' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi xóa công ty lữ hành' });
    }
};

// Like công ty lữ hành
exports.likeAgency = async (req, res) => {
    try {
        const agency = await TravelAgency.findByIdAndUpdate(
            req.params.id,
            { $inc: { likeCount: 1 } },
            { new: true }
        );
        res.json(agency);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi like công ty lữ hành' });
    }
};

// Dislike công ty lữ hành
exports.dislikeAgency = async (req, res) => {
    try {
        const agency = await TravelAgency.findByIdAndUpdate(
            req.params.id,
            { $inc: { dislikeCount: 1 } },
            { new: true }
        );
        res.json(agency);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi dislike công ty lữ hành' });
    }
};

// Thêm bình luận
exports.commentAgency = async (req, res) => {
    const { user, comment } = req.body;
    try {
        const agency = await TravelAgency.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: { user, comment } } },
            { new: true }
        );
        res.json(agency);
    } catch (error) {
        res.status(400).json({ error: 'Lỗi khi thêm bình luận' });
    }
};

// Lấy danh sách bình luận, dịch nếu cần
exports.getAgencyComments = async (req, res) => {
    try {
        const agency = await TravelAgency.findById(req.params.id).lean().select('comments');
        if (!agency) return res.status(404).json({ error: 'Không tìm thấy công ty lữ hành' });

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(agency.comments);
        }

        // Dịch bình luận
        const translatedComments = await Promise.all(
            (agency.comments || []).map(async c => ({
                ...c,
                comment: await translateField(c.comment, targetLang),
                user: await translateField(c.user, targetLang),
                createdAt: c.createdAt
            }))
        );

        res.json(translatedComments);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy bình luận' });
    }
};

// Lấy danh sách công ty lữ hành được thích nhiều nhất, dịch nếu cần
exports.getTopLikedAgencies = async (req, res) => {
    try {
        const agencies = await TravelAgency.find().sort({ likeCount: -1 }).lean();
        const targetLang = req.query.lng;

        if (!targetLang || targetLang === 'vi') {
            return res.json(agencies);
        }

        const translatedAgencies = await Promise.all(
            agencies.map(a => translateAgency(a, targetLang))
        );

        res.json(translatedAgencies);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách công ty được thích nhiều nhất' });
    }
};
