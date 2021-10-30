import {Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable, BaseEntity} from 'typeorm';
import {User} from "./User";
import {Role} from "./Role";

@Entity({
  name: 'groups'
})
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({
    length: 255,
    unique: true,
    nullable: false
  })
  name: string
  
  @OneToMany(() => User, user => user.group)
  users: User[];
  
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'group_role',
    joinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    }
  })
  roles: Role[]
}