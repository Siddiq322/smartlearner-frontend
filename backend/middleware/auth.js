const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    console.log('Auth middleware - Token header:', token ? 'Present' : 'Missing');

    if (!token) {
      return res.status(401).send({ error: 'No token provided' });
    }

    const cleanToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(cleanToken, config.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      console.log('User not found for ID:', decoded._id);
      throw new Error();
    }

    console.log('Auth successful for user:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

module.exports = auth;