const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const userRoute = require('./routes/user');
const authRoute = require('./routes/auth');
const productRoute = require('./routes/product');
const customerRoute = require('./routes/customer');
const orderRoute = require('./routes/order');
const pdf = require('html-pdf');
const cors = require('cors');

const pdfTemplate = require('./document');

mongoose
  .connect(
    `mongodb+srv://RodolpheBeloncle:${process.env.MONGO_PASSWORD}@cluster0.aafic.mongodb.net/wine-cellar?retryWrites=true&w=majority`
  )
  .then(() => console.log('DB Connection Successfull!'))
  .catch((err) => {
    console.log(err);
  });


  app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
    });
  
  const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));
// serving static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/auth', authRoute);
app.use('/api/users', userRoute);
app.use('/api/products', productRoute);
app.use('/api/orders', orderRoute);
app.use('/api/customers', customerRoute);

app.post('/api/create-pdf', (req, res) => {
  pdf.create(pdfTemplate(req.body), {}).toFile('result.pdf', (err) => {
    if (err) {
      res.send(Promise.reject());
    }

    res.send(Promise.resolve());
  });
});

app.get('/api/fetch-pdf', (req, res) => {
  res.sendFile(`${__dirname}/result.pdf`);
});

app.listen(process.env.PORT || 8000, () => {
  console.log('Backend server is running!');
});
