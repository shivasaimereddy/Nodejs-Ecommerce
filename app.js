const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/errorHandler');
require('dotenv/config');

app.use(cors());
app.options('*', cors())

//middleware 
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(errorHandler)

//Routers
const productRouter = require('./routers/product');
const categoryRouter = require('./routers/category');
const orderRouter = require('./routers/order');
const userRouter = require('./routers/user');

const api = process.env.API_URL;

app.use(`${api}/products`, productRouter);
app.use(`${api}/categories`, categoryRouter)
app.use(`${api}/orders`, orderRouter);
app.use(`${api}/users`, userRouter);

//Database Connection

mongoose
    .connect(process.env.DB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'tezerydb'
    })
    .then(() => {
        console.log("Database Connected")
    })
    .catch((err) => {
        console.log(err)
    })


//override _id to id

mongoose.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
        delete converted._id;
    }
});


//server

app.listen(3000, () => {
    console.log(api)
    console.log('Server Running at http://localhost:3000')
})