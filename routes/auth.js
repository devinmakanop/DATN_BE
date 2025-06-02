const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Admin = require('../models/admin')

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

// Đăng ký
router.post('/register', async (req, res) => {
  const { fullName, email, phone, username, password } = req.body;

  try {
    // Kiểm tra email đã tồn tại
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ code: 400, message: 'Email already exists' });
    }

    // Kiểm tra username đã tồn tại
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(401).json({ code: 401, message: 'Username already exists' });
    }

    // Tạo người dùng mới
    const newUser = new User({
      fullName,
      email,
      phone,
      username,
      password, // Sẽ được mã hóa bởi userSchema.pre('save')
    });

    await newUser.save();

    res.status(201).json({ code: 200, message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ code: 500, message: 'Registration failed', error: err.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user});
    } catch (err) {
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
