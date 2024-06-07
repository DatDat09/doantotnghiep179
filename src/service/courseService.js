const Course = require("../models/course")
const aqp = require('api-query-params')

module.exports = {
  createCourse: async (data) => {
    // if (data.type === "EMPTY-Course") {
    let result = await Course.create(data)
    return result
    // }

  },
  getCourse: async (queryString) => {
    const page = queryString.page
    const { filter, limit, population } = aqp(queryString);
    delete filter.page
    let offset = (page - 1) * limit
    result = await Course.find(filter)
      .populate(population)
      .skip(offset)
      .limit(limit)
      .exec();

    return result
  },
  dCourse: async (id) => {
    let result = await Course.deleteById(id)
    return result
  },
  uCourse: async (data) => {
    let result = await Course.updateOne({ _id: data.id }, { ...data })
    return result
  },
}