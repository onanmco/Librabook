import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToMany, JoinTable, OneToMany, JoinColumn, Unique } from 'typeorm';
import { BookUser } from './BookUser';
import { User } from './User';

@Entity({
  name: 'books'
})
@Unique(['content'])
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 255,
    nullable: false
  })
  name: string;

  @Column({
    length: 255,
    nullable: false
  })
  author: string

  @Column({
    nullable: false
  })
  page_count: number;

  @Column({
    length: 255,
    nullable: false
  })
  content: string;

  @OneToMany(() => BookUser, junction => junction.book)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'book_id'
  })
  junction: BookUser[]
}