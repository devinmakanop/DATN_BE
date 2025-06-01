const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
    title: String,             // Tiêu đề bước
    content: String,           // Nội dung chi tiết
    image: String              // (Tuỳ chọn) Link ảnh minh họa cho bước đó
}, { _id: false });

const ResidenceGuideSchema = new mongoose.Schema({
    title: { type: String, required: true },  // Tên hướng dẫn
    description: String,                      // Mô tả ngắn gọn (tóm tắt)
    link: String,                             // (Tuỳ chọn) link tham khảo ngoài
    steps: [StepSchema]                       // Danh sách các bước chi tiết
});

module.exports = mongoose.model('ResidenceGuide', ResidenceGuideSchema);
