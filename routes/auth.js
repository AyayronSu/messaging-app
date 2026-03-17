const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashed });
        await user.save();
        res.status(201).json({ message: 'User created' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {expiresIn: '1d' });
        res.json({ token, user: { username: user.username, email: user.email, avatar: user.avatar, bio: user,bio } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/update', async (req, res) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            {
                username: req.body.username,
                avatar: req.body.avatar,
                bio: req.body.bio
            },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get('/users', async (req, res) => {
    const users = await User.find().select('_id username');
    res.json(users);
});

module.exports = router;