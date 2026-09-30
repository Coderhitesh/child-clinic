const Testimonial = require('../models/Testimonial');
module.exports = require('../utils/crudFactory')(Testimonial, { populate: 'clinic name', defaultSort: 'order -createdAt' });
