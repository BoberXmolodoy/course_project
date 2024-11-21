const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.render('user_list', { users });
    } catch (err) {
        res.status(500).send(err);
    }
});


router.get('/new', (req, res) => {
    res.render('user_new');
});


router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });

    try {
        await newUser.save();
        res.redirect('/users');
    } catch (err) {
        res.status(500).send(err);
    }
});


router.get('/:id/edit', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('user_edit', { user });
    } catch (err) {
        res.status(500).send(err);
    }
});


router.post('/:id', async (req, res) => {
    const { username, password } = req.body;
    const updatedUser = { username };
    if (password) {
        updatedUser.password = await bcrypt.hash(password, 10);
    }

    try {
        await User.findByIdAndUpdate(req.params.id, updatedUser);
        res.redirect('/users');
    } catch (err) {
        res.status(500).send(err);
    }
});


router.post('/:id/delete', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect('/users');
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
