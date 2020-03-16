const fs = require('fs');
const { resolve } = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: resolve(__dirname, '../../config.env') });

// --------- create db conection string from env var ----------

const DB = process.env.DB_STR.replace('<USER>', process.env.DBUSER)
  .replace('<DB>', process.env.DB)
  .replace('<PASSWORD>', process.env.DBPASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log('db connection succeful!'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

//import data
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false }); //// to avoid validation error
    await Review.create(reviews);
    console.log('data succesfuly imported');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
//clear database first
const deleteDate = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('database succesfuly wiped');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};
if (process.argv[2] === '--delete') deleteDate();
else if (process.argv[2] === '--import') importData();
