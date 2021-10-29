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
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to insert all roles to the db.`);
    Roles.getAllRoles().forEach(async (role) => {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to insert role '${role}' to the db.`);
      try {
        await Role.create({
          name: role
        }).save();
      } catch (error) {
        console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to insert role '${role}' to the db.`);
      }
    });
    
    //seed groups to db
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to insert all groups to the db.`);
    Groups.getAllGroups().forEach(async (group) => {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to insert group '${group}' to the db.`);
      try {
        await Group.create({
          name: group
        }).save();
      } catch (error) {
        console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to insert group '${group}' to the db.`);
      }
    });

    //associate roles with groups
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to associate roles with groups on the db.`);
    const groups = await Group.find();
    
    groups.forEach(async (group) => {
      const rolesForCurrentGroup = [];
      const roleNames = group.name == Groups.ROOT ? Roles.getRootRoles() : Roles.getConsumerRoles();
      
      roleNames.forEach(async (roleName) => {
        const role = await Role.findOne({
          where: {
            name: roleName
          }
        });
        rolesForCurrentGroup.push(role);
      });
      group.roles = rolesForCurrentGroup;
      try {
        await group.save();
      } catch (error) {
        console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to associate roles with group ${group.name} on the db.`);
      }
    });
    
    //create root users
    console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to create root users.`);
    const rootCredentials = JSON.parse(process.env.ROOT_CREDS);
    
    rootCredentials.forEach(async (cred) => {
      console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Starting to create root user with email ${cred.email}.`);
      try {
        const user = User.create({
          email: cred.email,
          password_hash: bcrypt.hashSync(cred.password, 10),
          first_name: cred.first_name,
          last_name: cred.last_name,
          group_id: groups.filter(g => g.name === Groups.ROOT)[0].id,
        });

        await user.save();
      } catch (error) {
        console.debug(`${new Date().toISOString()} - [DEBUG] DBSeeder -> seed(): Failed to create root user with email ${cred.email}.`);
      }
    });
  }
}