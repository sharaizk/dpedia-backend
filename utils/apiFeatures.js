class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    console.log("filtering");
    // 1) Filtereing
    // create the hard copy of the query object
    const queryObj = { ...this.queryString };
    let excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    // 2) Advance Filtering

    // replace the parameters with the $ sign before them using regular expression
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt|eq)\b/g,
      (match) => `$${match}`
    );

    // Generate Query
    if (this.query.op === "find") {
      this.query = this.query.find(JSON.parse(queryString));
    } else if ((this.query.op = "countDocuments")) {
      this.query = this.query.countDocuments(JSON.parse(queryString));
    }
    return this;
  }

  sort() {
    console.log("sorting");
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  fieldsLimiting() {
    if (this.queryString.fields) {
      let showFields = this.queryString.fields.split(",");
      showFields = showFields.join(" ");
      this.query = this.query.select(showFields);
    }
    return this;
  }

  pagination() {
    if(!this.queryString.page && !this.queryString.limit) return this
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
