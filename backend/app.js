const express = require('express');
const cors = require("cors");
const AppError = require('./utils/appError');
const postRouter = require('./Routes/postRoutes');
const userRouter = require('./Routes/userRoutes');
const gobalErrorHandler = require('./controllers/errorController')
const opinionRouter = require('./Routes/opinionRoutes');
const compression = require('compression');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(`${__dirname}/public`));

app.use(compression());

app.use((req,res,next)=>{
    req.requestTime = new Date().toISOString();
    // console.log(req.requestTime);
    next();
})

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/opinions', opinionRouter);


app.all('*',(req,res,next)=>{
    next(new AppError(`Can't find the ${req.originalUrl} on this server`,404));
});

app.use(gobalErrorHandler)
 
module.exports = app;