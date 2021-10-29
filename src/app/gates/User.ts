import _ from 'lodash';
import { User as UserEntity } from '../entities/User';
import { Roles } from '../constants/Roles';

export class User {
  public static canCreateRootUser(user: UserEntity) {
    const _roles = _.keyBy(user.group.roles, 'name');
    return !!_roles[Roles.CREATE_ROOT_USER]
  }
}