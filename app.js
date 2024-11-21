const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const flash = require('connect-flash');

const app = express();


require('./config/passport')(passport);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


mongoose.connect('mongodb+srv://bbeznosuk9:Lt44rflQwt7g3dWA@cluster0.hi2qr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB.');
});


const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const materialsRouter = require('./routes/materials');
const usersRouter = require('./routes/users');
const logsRouter = require('./routes/logs'); // Додано маршрут для журналів

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/materials', materialsRouter);
app.use('/users', usersRouter);
app.use('/logs', logsRouter); 


app.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login');  
    });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
