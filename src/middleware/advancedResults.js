const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy of request query
  const reqQuery = { ...req.query };

  // fields to exclude during filtering
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // loop over removeFields and delete from the request query
  removeFields.forEach(param => delete reqQuery[param]);

  // create a query string
  let queryStr = JSON.stringify(reqQuery);

  // add operators to the query string
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // build the query
  query = model.find(JSON.parse(queryStr));

  // select fields to return
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // sort by createdAt date descending
    query = query.sort('-createdAt');
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // populate
  if (populate) {
    query = query.populate(populate);
  }

  // execute the query
  const results = await query;

  // pagination result
  const pagination = {};

  // next page
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  // previous page
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
};

module.exports = advancedResults;
