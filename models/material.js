const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    description: { type: String },
    type: { type: String, required: true, enum: ['Зброя', 'Боєприпаси', 'Продовольство', 'Обладнання', 'Медичні засоби'] }
});

const Material = mongoose.model('Material', materialSchema);

module.exports = Material;
