const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const { check, validationResult } = require('express-validator');

// Маршрут для відображення форми реєстрації
router.get('/register', (req, res) => {
    res.render('register', { messages: req.flash() });
});

// Обробка реєстрації користувача
router.post('/register', [
    check('username').not().isEmpty().withMessage('Користувач є обов’язковим.'),
    check('password').isLength({ min: 6 }).withMessage('Пароль повинен містити щонайменше 6 символів.'),
    check('role').not().isEmpty().withMessage('Роль є обов’язковою.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg).join(' '));
        return res.redirect('/auth/register');
    }

    const { username, password, role } = req.body;
    const newUser = new User({ username, password, role });
    try {
        await newUser.hashPassword();
        await newUser.save();
        res.redirect('/auth/login');
    } catch (err) {
        req.flash('error', 'Реєстрація користувача не вдалася.');
        res.redirect('/auth/register');
    }
});

// Маршрут для відображення форми логіну
router.get('/login', (req, res) => {
    res.render('login', { messages: req.flash() });
});

// Обробка логіну користувача
router.post('/login', [
    check('username').not().isEmpty().withMessage('Користувач є обов’язковим.'),
    check('password').not().isEmpty().withMessage('Пароль є обов’язковим.')
], (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(error => error.msg).join(' '));
        return res.redirect('/auth/login');
    }

    passport.authenticate('local', {
        successRedirect: '/materials',
        failureRedirect: '/auth/login',
        failureFlash: true
    })(req, res, next);
});

// Обробка виходу користувача
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth/login');
});

module.exports = router;
