const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const USer = require('./Models/userModel');
const Opinion = require('./Models/opinionModel')

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err, err.message);
  process.exit(1);
});

dotenv.config({ path : './config.env'});
const app = require('./app');

const Post = require('./Models/postModel');
const { json } = require('express');
const User = require('./Models/userModel');


  

const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);

mongoose.connect(DB,{}).then(()=> console.log('DB connect successfully..'));

const data = JSON.parse(fs.readFileSync('./userData.json','utf-8'));




const server = app.listen( 8000, ()=>{
    console.log(`App is listening on ${process.env.PORT}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err, err.message,err.name);
  server.close(() => {
    process.exit(1);
  });
});
