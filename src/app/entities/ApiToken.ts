import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne, BaseEntity } from 'typeorm';
import { User } from "./User";

@Entity({
  name: 'api_tokens'
})
export class ApiToken extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false
  })
  user_id: number;

  @Column({
    unique: true,
    nullable: false
  })
  token: string;

  @Column({
    nullable: false
  })
  created_at: Date;

  @Column({
    nullable: false
  })
  expires_at: Date;

  @ManyToOne(() => User, user => user.api_tokens, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id'
  })
  user: User;
}