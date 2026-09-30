const router = require('express').Router();
const ctrl = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.patch('/:id', ctrl.update);
router.post('/:id/docs', ctrl.addDoc);
router.delete('/:id', ctrl.remove);

module.exports = router;
