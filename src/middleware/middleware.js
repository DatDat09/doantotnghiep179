const jwt = require("jsonwebtoken");

const middleware = {
  verifyToken: async (req, res, next) => {
    try {
      const token = req.headers.cookie.split('token=')[1];
      if (!token) {
        return res.status(403).json({ message: 'No token provided' });
      }

      const payload = jwt.verify(token, 'namdv');
      req.user = payload;
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
  },
  roleAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
  },
  roleTeacher: (req, res, next) => {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied: Teachers only' });
    }
    next();
  },
  roleStudent: (req, res, next) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied: Students only' });
    }
    next();
  }
};

module.exports = middleware;
