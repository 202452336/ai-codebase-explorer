import { verifyToken } from '../config/firebase.js';

export const requireAuth = async(req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decoded = await verifyToken(token);
        req.user = {
            uid: decoded.uid,
            email: decoded.email,
            name: decoded.name,
            picture: decoded.picture
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};