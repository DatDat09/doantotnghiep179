const bcrypt = require('bcrypt');
const bcryptUtil = {
  verify: async (hashString, string) => {
    return await bcrypt.compare(string, hashString);
  },
  hash: async (string) => {
    return await bcrypt.hash(string, 10);
  }
}

module.exports = bcryptUtil;