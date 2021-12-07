const Tour = require('./../models/tourModel');

//creating a middleware which return top 5 tours
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {}
}

exports.getAllTours = async (req, res) => {
  try {
    //BUILD QUERY
    // 1. Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //console.log(req.query, queryObj);
    // 2. Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log(JSON.parse(queryStr));

    //{ difficulty: 'easy', duration: { $gte: 5 } } - query obj in mongo db
    //{ difficulty: 'easy', duration: { gte: 5 } } - returned by req.query

    let query = Tour.find(JSON.parse(queryStr));

    // 3. Sorting

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' '); //to handle multipe criteria for sort
      console.log(sortBy);
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // default criteria to be sort
    }

    //4. Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      console.log(req.query.fields, fields);
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    //5. Pagination
    const page = req.query.page * 1 || 1; //convert string to number
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments(); //de unde asteptam un promise???
      if (skip >= numTours) throw new Error('This page does not exist!');
    }

    // const tours = Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where(difficulty)
    //   .equals('easy');

    //EXECUTE QUERY
    const tours = await query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      message: err,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTours = new Tour({});
    // newTours.save();

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'succes',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true, //because we want to return the new document
      runValidators: true, //keep the type
    });
    res.status(202).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'Failed',
      message: err,
    });
  }
};
