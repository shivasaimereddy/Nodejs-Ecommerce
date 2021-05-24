const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose')

router.get('/', async (req, res) => {
    try {
        const categoryList = await Category.find();
        res.json(categoryList);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false
        })
    }
})

router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false
        })
    }
})

router.post('/', async (req, res) => {
    const category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })
    try {
        const a = await category.save();
        res.json(a)
    } catch (err) {
        res.status(404).json({
            message: 'Category cannot be created',
            error: err,
            success: false
        })
    }
})

router.put('/:id', async (req, res) => {

    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json('Invalid Category ID')
    }

    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    }, { new: true })
    try {
        res.status(200).json(category)
    } catch (err) {
        res.status(404).json({
            message: 'The category cannot be Updated',
            error: err,
            success: false
        })
    }
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then(Category => {
            if (Category) {
                return res.status(200).json({
                    success: true,
                    message: 'The Category has been deleted'
                })
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Category Cannot be found'
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