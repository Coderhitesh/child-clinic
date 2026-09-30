const router = require('express').Router();
const ctrl = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/rbac');

router.use(protect);
router.post('/', restrictTo('superadmin', 'clinic_admin', 'doctor'), ctrl.create);
router.get('/', restrictTo('superadmin', 'clinic_admin', 'doctor', 'receptionist'), ctrl.list);
router.get('/:id', ctrl.getOne);
router.put('/:id', restrictTo('superadmin', 'clinic_admin'), ctrl.update);
router.get('/patient/:patientId', ctrl.listByPatient);

module.exports = router;
