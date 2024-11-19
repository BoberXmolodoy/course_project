const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://bbeznosuk9:Lt44rflQwt7g3dWA@cluster0.hi2qr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB.');
});

module.exports = db;
