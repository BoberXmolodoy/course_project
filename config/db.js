const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://bbeznosuk9:KAbfxI9yiKX9XGhy@cluster0.0jwwi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB.');
});

module.exports = db;
