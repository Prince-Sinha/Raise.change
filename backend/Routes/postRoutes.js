const express = require('express');
const postController = require('./../controllers/postController')
const router = express.Router();


router.get('/unresolved',postController.unresolvedPost)
   
   

router.get('/resolved', postController.resolvedPost)

router
  .route('/:id')
  .get(postController.getonePost)
  .patch(postController.updatePost)

router
    .route('/create')
    .post(postController.createPost)


module.exports = router; 