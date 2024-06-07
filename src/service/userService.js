const User = require('../models/user');
const aqp = require('api-query-params');
const path = require("path");

module.exports = {
  postUploadImg: async (fileObject, userId) => {
    let uploadPath = path.resolve(__dirname, "../public/img/upload");

    // Get image extension
    let extName = path.extname(fileObject.name);

    // Get image's name (without extension)
    let baseName = path.basename(fileObject.name, extName);

    // Create final path: eg: /upload/your-image.png
    let timestamp = Date.now();
    let finalName = `${user.mssv}${extName}`;
    let finalPath = `${uploadPath}/${finalName}`;

    try {
      await fileObject.mv(finalPath);

      // Update user's description with the image path
      let user = await User.findById(userId);
      if (!user) {
        return {
          status: 'failed',
          path: null,
          error: 'User not found'
        };
      }

      user.image = `/img/upload/${finalName}`;
      await user.save();

      return {
        status: 'success',
        path: finalName,
        error: null
      };
    } catch (err) {
      console.log(">>> check error: ", err);
      return {
        status: 'failed',
        path: null,
        error: JSON.stringify(err)
      };
    }
  },
  getUserById: async (paramsString) => {
    let result = await User.findById(paramsString);
    return result;
  },
  getUserByUsername: async (username) => {
    return await User.findOne({ username });
  },
  getUser: async (queryString) => {
    const page = queryString.page;
    const { filter, limit, population } = aqp(queryString);
    delete filter.page;
    let offset = (page - 1) * limit;
    let result = await User.find(filter)
      .populate(population)
      .skip(offset)
      .limit(limit)
      .exec();

    return result;
  },
  createUser: async (data) => {
    let result = await User.create(data);
    return result;
  },
  dUser: async (id) => {
    let result = await User.deleteById(id);
    return result;
  },
  uUser: async (data) => {
    let result = await User.updateOne({ _id: data.id }, { ...data });
    return result;
  },
};
