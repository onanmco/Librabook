import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, BaseEntity} from 'typeorm';
import {Group} from "./Group";

@Entity({
  name: 'roles'
})
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({
    length: 255,
    nullable: false,
    unique: true
  })
  name: string

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'group_role',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'group_id',
      referencedColumnName: 'id'
    }
  })
  groups: Group[]
}