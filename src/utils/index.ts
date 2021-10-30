import crypto from 'crypto';
import { Request } from 'express';
import { Connection, EntityTarget } from 'typeorm';

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

export function getTableColumns<T>(connection: Connection, entity: EntityTarget<T>): string[] {
  try {
    return connection.getMetadata(entity).columns.map(col => col.propertyName);
  } catch (error) {
    return [];
  }
}

export function getTableName<T>(connection: Connection, entity: EntityTarget<T>): string {
  try {
    return connection.getMetadata(entity).tableName;
  } catch(error) {
    return null;
  }
}

export function getJunctionTableName<T>(entities: EntityTarget<T>[]): string {
  return entities
    .map(entity => getClassName(entity as Function).toLowerCase())
    .sort(sortCaseInsensitive)
    .join('_');
}

export function sortCaseInsensitive(a: string, b: string): number {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

export function getClassName(classConstructor: Function): string {
  try {
    const pattern = /function (?<className>[^(]+)\(/;
    const constructor = classConstructor.toString();
    return constructor.match(pattern).groups.className;
  } catch (error) {
    return null;
  }
}