class APIfeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    //1- excluding page,limit,...
    const queryObj = { ...this.queryStr }; //hard copy obj in es6
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    //2- operators exclution
    const queryStr = JSON.stringify(queryObj).replace(
      /\b(gt|gte|lt|lte)\b/g,
      match => `$${match}`
    );

    // apply filtering
    //let query = Tour.find(JSON.parse(queryStr));
    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    //b- Sorting
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      const sortBy = '-createdAt';
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  fields() {
    // fields selection
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.split(',').join(' ');
      this.query = this.query.select(fields); //[field1 field2]
    } else {
      this.query = this.query.select('-__V'); //exclude __V field
    }
    return this;
  }

  pagination() {
    //pagination
    const page = this.queryStr.page * 1 || 1;
    const limit = this.queryStr.limit * 1 || 10;
    const skip = (page - 1) * limit;
    //console.log(`page :${page}  limit :${limit}   skip :${skip}`);
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIfeatures;
