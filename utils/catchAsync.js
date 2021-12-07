//catchAsync function return another function which is gonna be asigned to createTour
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //we transfer the catch err to this function
  };
};
