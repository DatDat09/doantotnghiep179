const ClassExam = require("../models/classExam")
const aqp = require('api-query-params')

module.exports = {
  createClassExam: async (data) => {
    // if (data.type === "EMPTY-CTDT") {
    let result = await ClassExam.create(data)
    return result
    // }
  },
  getClassExam: async (queryString) => {
    const page = queryString.page
    const { filter, limit, population } = aqp(queryString);
    delete filter.page
    let offset = (page - 1) * limit
    result = await ClassExam.find(filter)
      .populate(population)
      .skip(offset)
      .limit(limit)
      .exec();

    return result
  },
  dClassExam: async (id) => {
    let result = await ClassExam.deleteById(id)
    return result
  },
  uClassExam: async (data) => {
    console.log(">>CHeck data:", data)
    let result = await ClassExam.updateOne({ _id: data.id }, { ...data })
    return result
  },
}