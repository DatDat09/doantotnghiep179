const Class = require("../models/class")
const aqp = require('api-query-params')

module.exports = {
  createClass: async (data) => {
    // if (data.type === "EMPTY-CTDT") {
    let result = await Class.create(data)
    return result
    // }
  },
  getClass: async (queryString) => {
    const page = queryString.page
    const { filter, limit, population } = aqp(queryString);
    delete filter.page
    let offset = (page - 1) * limit
    result = await Class.find(filter)
      .populate(population)
      .skip(offset)
      .limit(limit)
      .exec();

    return result
  },
  dClass: async (id) => {
    let result = await Class.deleteById(id)
    return result
  },
  uClass: async (data) => {
    console.log(">>CHeck data:", data)
    let result = await Class.updateOne({ _id: data.id }, { ...data })
    return result
  },
}