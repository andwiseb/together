import { NextFunction, Request, Response } from 'express';

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization');
    if (!authHeader) {
        return res.status(401).json({ message: 'No token, access denied' });
    }

    try {
        const token = authHeader.split(' ')[1];
        console.log('auth middleware, token:', token);
        // const user = jwt.verify(token, process.env.JWT_SECRET);
        req['user'] = token;
        // req.ability = defineAbilityFor(user);
        next();
    } catch (err) {
        res.status(403).json({ message: 'Token is not valid', err });
    }
};
