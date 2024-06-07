const CTDT = require("../models/ctdt")
const aqp = require('api-query-params')

module.exports = {
  createCTDT: async (data) => {
    let result = await CTDT.create(data)
    return result
  },
  getCTDT: async (queryString) => {
    const page = queryString.page
    const { filter, limit, population } = aqp(queryString);
    delete filter.page
    let offset = (page - 1) * limit
    result = await CTDT.find(filter)
      .populate(population)
      .skip(offset)
      .limit(limit)
      .exec();

    return result
  },
  dCTDT: async (id) => {
    let result = await CTDT.deleteById(id)
    return result
  },
  uCTDT: async (data) => {
    let result = await CTDT.updateOne({ _id: data.id }, { ...data })
    return result
  },
}