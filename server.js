const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// i18n

// Load env
dotenv.config();

// Kết nối DB
connectDB();

const app = express();

// Cấu hình i18next

// Middleware chung
app.use(cors());
app.use(express.json());

// ✅ Middleware tự động dịch JSON response toàn cục (chỉ dùng 1 lần)

// Load route modules
const aiRoutes = require('./routes/aiRoutes');
const locationRoutes = require('./routes/locationRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const travelAgencyRoutes = require('./routes/travelAgencyRoutes');
const residenceGuide = require('./routes/residenceGuideRoutes');
const authRoutes = require('./routes/auth');
const accommodationRoutes = require('./routes/accommodationRoutes');
const translationRoutes = require('./routes/translationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');

const adminRoutes = require("./routes/admin")

// Đăng ký routes (KHÔNG thêm autoTranslateMiddleware ở đây nữa)
app.use('/api/auth', authRoutes);
app.use('/api/chat', aiRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/travelAgency', travelAgencyRoutes);
app.use('/api/residenceGuide', residenceGuide);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/', adminRoutes)

// Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server chạy tại http://localhost:${PORT}`));
