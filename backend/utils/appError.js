class AppError extends Error{
    constructor(message, StatusCode){
      super(message);
      this.StatusCode = StatusCode;
      this.status = `${StatusCode}`.startsWith('4') ? 'Bad Connection' : 'error';
      this.isOperational = true
      Error.captureStackTrace(this, this.constructor);
    }
 }
 
 module.exports = AppError;