const { createKqht, getKqht, dKqht, uKqht } = require("../service/kqhtService")



module.exports = {
  postCreateKqht: async (req, res) => {
    let result = await createKqht(req.body)
    return res.status(200).json({
      EC: 0,
      data: result
    })
  },
  getAllKqht: async (req, res) => {
    let result = await getKqht(req.query)
    return res.status(200).json({
      EC: 0,
      data: result
    })
  },
  deleteKqht: async (req, res) => {
    let result = await dKqht(req.body.id)
    return res.status(200).json({
      EC: 0,
      data: result
    })
  },
  updateKqht: async (req, res) => {
    let result = await uKqht(req.body)
    return res.status(200).json({
      EC: 0,
      data: result
    })
  },
}