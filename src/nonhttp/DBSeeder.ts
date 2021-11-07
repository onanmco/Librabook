import * as dotenv from 'dotenv';
import { Groups } from '../app/constants/Groups';
import { Roles } from '../app/constants/Roles';
import { Group } from '../app/entities/Group';
import { Role } from '../app/entities/Role';
import { User } from '../app/entities/User';
import bcrypt from 'bcrypt';
dotenv.config();

export class DBSeeder {
  public static async seed(): Promise<void> {
    //seed roles to db
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Started to create roles.`);
    try {
      const roleNames = Roles.getAllRoles();

      for (let i = 0; i < roleNames.length; i++) {
        const role = roleNames[i];
          const savedRole = Role.create({ name: role });
          await savedRole.save();
      }
    } catch (error) {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Started to create roles.`);
    }

    //seed groups to db
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Started to create groups.`);
    try {
      const groupNames = Groups.getAllGroups();
      for (let i = 0; i < groupNames.length; i++) {
        const group = groupNames[i];
          const savedGroup = Group.create({ name: group });
          await savedGroup.save();
      }
    } catch (error) {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to create groups.`);
    }

    //associate roles with groups
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Started to associate roles with groups.`);
    try {
      const groups = await Group.find();

      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        const rolesForCurrentGroup = [];
        const roleNames = group.name == Groups.ROOT ? Roles.getAllRoles() : Roles.getConsumerRoles();

        for (let j = 0; j < roleNames.length; j++) {
          const role = await Role.findOne({ where: { name: roleNames[j] } });
          rolesForCurrentGroup.push(role);
        }
        group.roles = rolesForCurrentGroup;
          await group.save();
      }
    } catch (error) {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to associate roles with groups.`);
    }

    //create root users
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Started to create root users.`);
    try {
      const rootCredentials = JSON.parse(process.env.ROOT_CREDS);
      const groups = await Group.find();

      for (let i = 0; i < rootCredentials.length; i++) {
          const cred = rootCredentials[i];
          const user = User.create({
            email: cred.email,
            password_hash: bcrypt.hashSync(cred.password, 10),
            first_name: cred.first_name,
            last_name: cred.last_name,
            group_id: groups.filter(g => g.name === Groups.ROOT)[0].id
          });
          await user.save();
      }
    } catch (error) {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to create root users.`);
    }
  }
}