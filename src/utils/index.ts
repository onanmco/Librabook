import crypto from 'crypto';
import { Request } from 'express';
import { EntityTarget, getConnection } from 'typeorm';
import { Sortable } from '../app/types/Sortable';

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

export async function getTableColumns<T extends Sortable>(entity: EntityTarget<T>): Promise<string[]> {
  try {
    return await getConnection().getMetadata(entity).columns.map(col => col.propertyName);
  } catch (error) {
    return [];
  }
}