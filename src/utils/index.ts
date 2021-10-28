import crypto from 'crypto';
import { Request } from 'express';

export function getRandomString() {
    return crypto.randomBytes(16).toString('hex');
}

export function getBearerToken(req: Request) {
    if (! req.headers) {
        return null;
    }

    if (! req.headers.authorization) {
        return null;
    }

    const match = req.headers.authorization.match(/(?<=Bearer ).*$/);

    if (! match) {
        return null;
    }

    return match[0];
}