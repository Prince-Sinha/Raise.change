const express = require('express')
const opinionController = require('../controllers/opinionController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(opinionController.getallOpinion)
  .post(opinionController.createOpinion);


module.exports = router;