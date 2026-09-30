const router = require('express').Router();
const ctrl = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);
// upload.any() so a client sending 'file', 'image' or anything else still works
router.post('/', upload.any(), ctrl.uploadOne);
router.post('/multiple', upload.any(), ctrl.uploadMany);
router.delete('/', ctrl.remove);

module.exports = router;
