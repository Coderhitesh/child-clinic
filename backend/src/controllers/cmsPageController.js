const CmsPage = require('../models/CmsPage');
module.exports = require('../utils/crudFactory')(CmsPage, { defaultSort: 'title' });
