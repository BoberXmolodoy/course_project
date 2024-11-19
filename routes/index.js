const express = require('express');
const router = express.Router();
const Material = require('../models/material');

router.get('/', async (req, res) => {
    try {
        const materials = await Material.find();
        res.render('index', { materials });
    } catch (err) {
        res.status(500).send(err);
    }
});

module.exports = router;
