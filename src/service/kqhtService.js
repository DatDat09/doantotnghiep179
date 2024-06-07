const Kqht = require("../models/kqht")
const aqp = require('api-query-params')

module.exports = {
  createKqht: async (data) => {
    let result = await Kqht.create(data)
    return result
  },
  getKqht: async (queryString) => {
    const page = queryString.page
    const { filter, limit, population } = aqp(queryString);
    delete filter.page
    let offset = (page - 1) * limit
    result = await Kqht.find(filter)
      .populate(population)
      .skip(offset)
      .limit(limit)
      .exec();

    return result
  },
  dKqht: async (id) => {
    let result = await Kqht.deleteById(id)
    return result
  },
  uKqht: async (data) => {
    let result = await Kqht.updateOne({ _id: data.id }, { ...data })
    return result
  },
}