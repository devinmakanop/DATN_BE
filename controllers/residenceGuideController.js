const ResidenceGuide = require('../models/residenceGuide');
const translate = require('google-translate-api-x');

// Dịch một chuỗi đơn lẻ
async function translateField(text, targetLang) {
    if (!text || typeof text !== 'string') return text;
    try {
        const res = await translate(text, { to: targetLang });
        return res.text;
    } catch (err) {
        console.error('Translate error:', err.message);
        return text; // fallback
    }
}

// Dịch toàn bộ hướng dẫn (bao gồm steps)
async function translateGuide(guide, targetLang) {
    const translatedSteps = await Promise.all(
        (guide.steps || []).map(async (step) => ({
            title: await translateField(step.title, targetLang),
            content: await translateField(step.content, targetLang),
            image: step.image || null,
        }))
    );

    return {
        _id: guide._id,
        title: await translateField(guide.title, targetLang),
        description: await translateField(guide.description, targetLang),
        link: await translateField(guide.link, targetLang),
        steps: translatedSteps,
    };
}

// Lấy tất cả hướng dẫn
exports.getAllGuides = async (req, res) => {
    try {
        const guides = await ResidenceGuide.find().lean();
        const targetLang = req.query.lng;

        if (!targetLang || targetLang === 'vi') {
            return res.json(guides);
        }

        const translated = await Promise.all(
            guides.map(g => translateGuide(g, targetLang))
        );

        res.json(translated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách hướng dẫn' });
    }
};

// Lấy một hướng dẫn cụ thể
exports.getGuide = async (req, res) => {
    try {
        const guide = await ResidenceGuide.findById(req.params.id).lean();
        if (!guide) {
            return res.status(404).json({ error: 'Không tìm thấy hướng dẫn' });
        }

        const targetLang = req.query.lng;
        if (!targetLang || targetLang === 'vi') {
            return res.json(guide);
        }

        const translated = await translateGuide(guide, targetLang);
        res.json(translated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi lấy hướng dẫn' });
    }
};

// Tạo mới một hướng dẫn
exports.createGuide = async (req, res) => {
    try {
        const newGuide = new ResidenceGuide(req.body);
        await newGuide.save();
        res.status(201).json(newGuide);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Lỗi khi tạo hướng dẫn' });
    }
};
