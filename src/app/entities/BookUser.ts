import { Entity, Column, ManyToOne, BaseEntity, JoinColumn } from 'typeorm';
import { Book } from './Book';
import { User } from './User';

@Entity({
  name: 'book_user'
})
export class BookUser extends BaseEntity {
  @Column({
    nullable: true
  })
  last_read_page: number;

  @Column({
    nullable: false,
    primary: true,
  })
  book_id: number;

  @Column({
    nullable: false,
    primary: true,
  })
  user_id: number;

  @ManyToOne(() => Book, book => book.junction, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({
    name: 'book_id',
    referencedColumnName: 'id'
  })
  book: Book;
  @ManyToOne(() => User, user => user.junction, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
  })
  user: User;
}