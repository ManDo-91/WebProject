const express= require('express');
const app = express();
const bodyParser= require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

app.use(cors());
app.options('*', cors());

const categoriesRoutes = require('./routers/categories');
const productsRouter=require('./routers/products');
const usersRoutes = require('./routers/users');
const ordersRoutes = require('./routers/orders');


const api= process.env.API_URL;

//middleware
app.use(bodyParser.json());
app.use(morgan('tiny'));

//routers
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`,productsRouter);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);



mongoose.connect(process.env.Connection_String/*,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'Scentify-database'
}*/)
.then(()=>{
    console.log('Database connection is ready...')
})
.catch((err)=>{
    console.log(err);
})

app.listen(3000, ()=>{
    console.log(api);
    console.log('server is running http://localhost:3000');
})
