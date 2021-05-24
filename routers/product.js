const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const { Product } = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpeg",
    "image/jpg": "jpg",
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error("invalid image type");

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, "uploads");
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(" ").join("-");
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const upload = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};

    if (req.query.categories) {
        filter = { category: req.query.categories.split(",") };
    }
    try {
        const productList = await Product.find(filter).populate("category");
        res.json(productList);
    } catch (err) {
        res.send("Error:" + err);
    }
});

router.get(`/count`, async (req, res) => {
    const productCount = await Product.countDocuments((count) => count);
    try {
        res.status(200).json({
            productCount: productCount,
        });
    } catch (err) {
        res.status(500).json({ error: err });
    }
});

router.get(`/featured/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) {
        res.status(500).json({ success: false });
    }
    res.status(200).json(products);
});

router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate("category");
        res.json(product);
    } catch (err) {
        res.json({
            success: false,
            error: err,
        });
    }
});

router.post(`/`, upload.single("image"), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const file = req.file;
    if (!file) return res.status(400).send("No image in the request");

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/uploads/`;

    const product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
    });

    try {
        a = await product.save();
        res.json(a);
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err,
        });
    }
});

router.put(
    '/gallery/:id',
    upload.array('images', 10),
    async (req, res) => {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id');
        }
        const files = req.files;
        let imagePaths = [];
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`;

        if (files) {
            files.map((file) => {
                imagePaths.push(`${basePath}${file.filename}`);
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagePaths,
            },
            { new: true }
        );
        try {
            res.status(200).json(product);
        } catch (err) {
            res.status(400).json({
                success: false,
                error: err,
            });
        }
    }
);

router.put(`/:id`, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).json("Invalid Product ID");
    }

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send("Invalid Category");

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true }
    );
    try {
        res.status(200).json(product);
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err,
        });
    }
});

router.delete("/:id", (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: "The Product has been deleted",
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Product Cannot be found",
                });
            }
        })
        .catch((err) => {
            return res.status(400).json({
                success: false,
                error: err,
            });
        });
});

module.exports = router;
