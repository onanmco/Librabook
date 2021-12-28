import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, BaseEntity, getRepository, getManager } from 'typeorm';
import { Book } from './Book';
import { BookUser } from './BookUser';
import { Group } from './Group';

@Entity({
  name: 'users'
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: false
  })
  group_id: number;

  @Column({
    nullable: true
  })
  last_read_book_id: number;

  @Column({
    length: 255,
    nullable: false,
    unique: true
  })
  email: string;

  @Column({
    length: 255,
    nullable: false
  })
  password_hash: string

  @Column({
    length: 255,
    nullable: false
  })
  first_name: string;

  @Column({
    length: 255,
    nullable: false
  })
  last_name: string;

  @ManyToOne(() => Book, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  })
  @JoinColumn({
    name: 'last_read_book_id',
    referencedColumnName: 'id'
  })
  last_read_book: Book;

  @OneToMany(() => BookUser, junction => junction.user)
  @JoinColumn({
    name: 'id',
    referencedColumnName: 'user_id'
  })
  junction: BookUser[];

  @ManyToOne(() => Group, group => group.users, {
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  })
  @JoinColumn({
    name: 'group_id',
    referencedColumnName: 'id'
  })
  group: Group;

  public async getBooks() {
    const userId = this.id;
    const entityManager = getManager();
    return await entityManager.query(`
        SELECT 
            b.*, 
            bu.last_read_page
        FROM
            book_user bu
            JOIN books b
                ON b.id = bu.book_id
            JOIN users u
                ON u.id = bu.user_id
        WHERE u.id = ?
    `, [userId]);
  }

  public async hasBook(book: Book) {
    const bookId = book.id;
    const userId = this.id;
    const books = await getRepository(Book).createQueryBuilder('book')
      .innerJoin('book.junction', 'junction')
      .where('book.id = :bookId', {bookId})
      .andWhere('junction.user_id = :userId', {userId})
      .getRawMany();

    return books.length > 0;
  }

  public async attachBook(book: Book) {
    const relation = BookUser.create({
      last_read_page: null,
      book_id: book.id,
      user_id: this.id
    });

    await relation.save();
  }

  public async detachBook(book: Book) {
    const relation = await BookUser.findOne({
      where: {
        book_id: book.id,
        user_id: this.id
      }
    });

    await relation.remove();
  }
}