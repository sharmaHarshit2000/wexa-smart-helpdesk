const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin required.' });
  }
  next();
};

const agentMiddleware = (req, res, next) => {
  if (!['admin', 'agent'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied. Agent or admin required.' });
  }
  next();
};

module.exports = { adminMiddleware, agentMiddleware };