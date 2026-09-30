const Category = require('../models/Category');
module.exports = require('../utils/crudFactory')(Category, { defaultSort: 'order name' });
