const express = require('express');
const { User } = require('../models/user');
const router = express.Router();
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

router.get('/', async (req, res) => {
    try {
        const userList = await User.find();
        res.json(userList);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false
        })
    }
})

router.get(`/count`, async (req, res) => {
    const userCount = await User.countDocuments((count) => count)
    try {
        res.status(200).json({
            userCount: userCount
        })
    } catch (err) {
        res.status(500).json({ error: err })
    }
})


router.get(`/:id`, async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json('Invalid User ID')
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        res.json({ message: "No User Found with this id" })
    }
    try {
        res.json(user);
    } catch (err) {
        req.status(500).json({
            error: err,
            success: false
        })
    }
})

router.post(`/`, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    try {
        a = await user.save()
        res.status(200).json(a)
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    })
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).send('User Not Found')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
                name: user.name,
                email: user.email
            }, secret, { expiresIn: '1d' }
        )
        res.status(200).send({ user: user.email, name: user.name, token: token })
    }
    else {
        return res.status(400).send('Wrong Password')
    }

})

router.post(`/register`, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password),
        phone: req.body.phone,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })
    try {
        a = await user.save()
        res.status(200).json(a)
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err
        })
    }
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (user) {
                return res.status(200).json({
                    success: true,
                    message: 'The User has been deleted'
                })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'User Cannot be found'
                })
            }
        }).catch(err => {
            return res.status(400).json({
                success: false,
                error: err
            })
        })
})

module.exports = router;