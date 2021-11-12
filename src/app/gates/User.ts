import _ from 'lodash';
import { User as UserEntity } from '../entities/User';
import { Roles } from '../constants/Roles';
import {Gate} from "./Gate";
import {Role} from "../entities/Role";

export class User extends Gate<UserEntity>{
  private roles: _.Dictionary<Role>;

  public constructor(user: UserEntity) {
    super(user);
    if (!!user) {
      this.roles = _.keyBy(user.group.roles, 'name');
    } else {
      this.roles = {};
    }
  }

  public canCreateRootUser() {
    return !!this.roles[Roles.CREATE_ROOT_USER];
  }

  public canCreateBook() {
    return !!this.roles[Roles.CREATE_BOOK];
  }

  public canDeleteBook() {
    return !!this.roles[Roles.DELETE_BOOK];
  }

  public canUpdateBook() {
    return !!this.roles[Roles.UPDATE_BOOK];
  }
}