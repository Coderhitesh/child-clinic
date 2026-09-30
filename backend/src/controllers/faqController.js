const Faq = require('../models/Faq');
module.exports = require('../utils/crudFactory')(Faq, { populate: 'category speciality', defaultSort: 'order' });
