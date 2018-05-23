const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session);

mongoose.connect('mongodb://127.0.0.1:27017/pinball');

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

//require(__dirname + 'routes.js')(app, passport);

//Server
app.listen(3000, () => console.log('Server running...'));
