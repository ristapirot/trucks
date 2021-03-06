var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

var User = require('./User');

router.post('/signup', function(req, res) {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'Mail exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, function(err, hash) {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        var user = new User({
                            name: req.body.name,
                            email: req.body.email,
                            password: hash
                        })
                        user
                            .save()
                            .then(result => {
                                console.log(result)
                                res.status(201).json({
                                    message: 'User created'
                                })
                            })
                            .catch(err => {
                                console.log(err)
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            } 
        })
})

router.post('/login', function(req, res) {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, function(err, result) {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                }

                if (result) {
                    const token = jwt.sign(
                    {
                        email: user[0].email,
                        userId: user[0].id
                    }, 
                    'secret', 
                    {
                        expiresIn: '1h'
                    }
                 )
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Auth failed'
                })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

// router.post('/', function(req, res) {
//     User.create({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password
//     }, function(err, user) {
//         if (err) return res.status(500).send('There was a problem adding the information to the database.');
//         res.status(200).send(user);
//     });
// });

router.get('/', function(req, res) {
    User.find({}, function(err, user) {
        if (err) return res.status(500).send('There was a problem finding the users.');
        res.status(200).send(user);
    });
});

router.get('/:id', function(req, res) {
    User.findById(req.params.id, function(err, user) {
        if (err) return res.status(500).send('There was a problem finding the user.');
        if (!user) return res.status(404).send('No user found!');
        res.status(200).send(user);
    });
});

router.delete('/:id', function(req, res) {
    User.findByIdAndRemove(req.params.id, function(err, user) {
        if (err) return res.status(500).send('There was a problem deleting a user.');
        res.status(200).send('User ' + user.name + ' was deleted.');
    });
});

router.put('/:id', function(req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, {new: true}, function(err, user) {
        if (err) return res.status(500).send('There was a problem updating the user.');
        res.status(200).send(user);
    })
})


module.exports = router;