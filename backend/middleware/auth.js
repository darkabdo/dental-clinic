import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    const rawRole = decoded.role;
    // Canonical roles + backward compatibility with older tokens
    req.userRole =
      rawRole === 'dentist'
        ? 'doctor'
        : rawRole === 'reception'
          ? 'receptionist'
          : rawRole;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
