const express = require('express');
const router = express.Router();
const Log = require('../models/log');
const { isAuthenticated, isAdmin } = require('../middleware/auth');


router.get('/', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const logs = await Log.find().populate('user').populate('material').sort({ timestamp: -1 });
        res.render('logs', { logs });
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
