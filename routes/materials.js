const express = require('express');
const router = express.Router();
const Material = require('../models/material');
const Log = require('../models/log'); 
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const ExcelJS = require('exceljs'); 


const createLog = async (action, user, material) => {
    const log = new Log({ action, user, material });
    await log.save();
};


router.get('/', isAuthenticated, async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const materials = await Material.find({ type: { $regex: searchQuery, $options: 'i' } });
        res.render('materials_list', {
            materials,
            user: req.user,
            message: req.flash('error'),
            successMessage: req.flash('success'),
            searchQuery
        });
    } catch (err) {
        res.status(500).send(err);
    }
});


router.get('/search', isAuthenticated, async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        const materials = await Material.find({ type: { $regex: searchQuery, $options: 'i' } });
        res.render('partials/materials_table', { materials, layout: false });
    } catch (err) {
        res.status(500).send(err);
    }
});


router.get('/new', isAuthenticated, (req, res) => {
    res.render('material_new', { user: req.user, message: req.flash('error') });
});


router.post(
    '/',
    isAuthenticated,
    [
        check('name').not().isEmpty().withMessage('Назва є обов’язковою.'),
        check('quantity').isInt({ min: 1 }).withMessage('Кількість має бути цілим числом більше 0.'),
        check('description').not().isEmpty().withMessage('Опис є обов’язковим.'),
        check('type').not().isEmpty().withMessage('Тип є обов’язковим.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg).join(' '));
            return res.redirect('/materials/new');
        }

        if (req.user.role !== 'admin') {
            req.flash('error', 'Недостатньо прав для виконання цієї дії');
            return res.redirect('/materials');
        }

        const material = new Material(req.body);
        try {
            await material.save();
            await createLog('create', req.user._id, material._id); // Створення запису журналу
            req.flash('success', 'Матеріал успішно додано');
            res.redirect('/materials');
        } catch (err) {
            res.status(500).send(err);
        }
    }
);


router.get('/:id/edit', isAuthenticated, async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);
        res.render('material_edit', { material, user: req.user, message: req.flash('error') });
    } catch (err) {
        res.status(500).send(err);
    }
});


router.post(
    '/:id',
    isAuthenticated,
    [
        check('name').not().isEmpty().withMessage('Назва є обов’язковою.'),
        check('quantity').isInt({ min: 1 }).withMessage('Кількість має бути цілим числом більше 0.'),
        check('description').not().isEmpty().withMessage('Опис є обов’язковим.'),
        check('type').not().isEmpty().withMessage('Тип є обов’язковим.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(error => error.msg).join(' '));
            return res.redirect(`/materials/${req.params.id}/edit`);
        }

        if (req.user.role !== 'admin') {
            req.flash('error', 'Недостатньо прав для виконання цієї дії');
            return res.redirect('/materials');
        }

        try {
            await Material.findByIdAndUpdate(req.params.id, req.body);
            await createLog('update', req.user._id, req.params.id); 
            req.flash('success', 'Матеріал успішно оновлено');
            res.redirect('/materials');
        } catch (err) {
            res.status(500).send(err);
        }
    }
);


router.post('/:id/delete', isAuthenticated, async (req, res) => {
    if (req.user.role !== 'admin') {
        req.flash('error', 'Недостатньо прав для виконання цієї дії');
        return res.redirect('/materials');
    }
    try {
        await Material.findByIdAndDelete(req.params.id);
        await createLog('delete', req.user._id, req.params.id); 
        req.flash('success', 'Матеріал успішно видалено');
        res.redirect('/materials');
    } catch (err) {
        res.status(500).send(err);
    }
});


router.get('/chart', isAuthenticated, async (req, res) => {
    try {
        const materials = await Material.find();
        if (materials.length === 0) {
            req.flash('error', 'Дані для графіка відсутні. Додайте матеріали.');
            return res.redirect('/materials');
        }
        res.render('materials_chart', { materials });
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get('/export', isAuthenticated, async (req, res) => {
    try {
        const searchQuery = req.query.search || '';
        let materials;

        
        if (searchQuery) {
            materials = await Material.find({ type: { $regex: searchQuery, $options: 'i' } });
        } else {
            materials = await Material.find(); 
        }

        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Матеріали');

        
        worksheet.columns = [
            { header: 'Назва', key: 'name', width: 20 },
            { header: 'Кількість', key: 'quantity', width: 15 },
            { header: 'Опис', key: 'description', width: 30 },
            { header: 'Тип', key: 'type', width: 20 }
        ];

        
        materials.forEach(material => {
            worksheet.addRow(material);
        });

        
        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
        });

        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="materials.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Помилка при експорті:', err);
        res.status(500).send('Помилка при експорті.');
    }
});

module.exports = router;
