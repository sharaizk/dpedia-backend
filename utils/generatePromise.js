module.exports = (func, query) => {
  return new Promise((resolve, reject) => {
    func.query(query, (error, result) => {
      if (error) {
        reject;
      }
      else {
        resolve(result);
      }
    })
  })
};
