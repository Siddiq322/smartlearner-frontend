const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const auth = async (req, res, next) => {
  try {
    console.log('AUTH MIDDLEWARE - Request:', {
      method: req.method,
      url: req.url,
      hasAuthHeader: !!req.header('Authorization'),
      userAgent: req.get('User-Agent')?.substring(0, 50)
    });

    const token = req.header('Authorization');
    if (!token) {
      console.log('AUTH FAIL: No token provided');
      return res.status(401).send({ error: 'No token provided' });
    }

    const cleanToken = token.replace('Bearer ', '');
    console.log('AUTH: Token present, length:', cleanToken.length);

    const decoded = jwt.verify(cleanToken, config.JWT_SECRET);
    console.log('AUTH: Token decoded, user ID:', decoded._id);

    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      console.log('AUTH FAIL: User not found for ID:', decoded._id);
      throw new Error();
    }

    console.log('AUTH SUCCESS: User authenticated:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('AUTH ERROR:', error.message);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;