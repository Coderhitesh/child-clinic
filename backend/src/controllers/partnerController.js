const Partner = require('../models/Partner');
module.exports = require('../utils/crudFactory')(Partner, { defaultSort: 'order' });
