import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, BaseEntity, getRepository } from 'typeorm';
import { ApiToken } from "./ApiToken";
import { Book } from './Book';
import { BookUser } from './BookUser';

@Entity({
  name: 'users'
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

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
  junction: BookUser[]

  @OneToMany(() => ApiToken, api_token => api_token.user)
  api_tokens: ApiToken[];

  public async getBooks() {
    const userId = this.id;
    const books = await getRepository(Book).createQueryBuilder('book')
      .innerJoin('book.junction', '')
      .where('user_id = :userId', {userId})
      .addSelect('last_read_page')
      .getRawMany()

    return books;
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