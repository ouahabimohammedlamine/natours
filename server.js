const dotenv = require('dotenv');
const mongoose = require('mongoose');

//catch uncaught Exceptions  example console.log(x); at very toop of our app
process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION,Shutting down...');
  process.exit(1); //give time to server to finish all tasks before shutting down
});

dotenv.config({ path: './config.env' });
const app = require('./app');

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
  .then(() => console.log('db connection succesful!'));
mongoose.set('useFindAndModify', false);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App listening on port ${port} ...`);
});

//catch unhandled promises rejections
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION,Shutting down...');
  server.close(() => {
    process.exit(1); //give time to server to finish all tasks before shutting down
  });
});
