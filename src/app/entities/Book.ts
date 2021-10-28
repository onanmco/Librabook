import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, ManyToMany, JoinTable, OneToMany, JoinColumn, Unique, getManager } from 'typeorm';
import { BookUser } from './BookUser';
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

  public static async getAllBooksSortedByReadingRate(sortOrder: string = 'DESC'): Promise<Book[]> {
    const pattern = new RegExp('(^asc$)|(^desc$)', 'i');
    const order = pattern.test(sortOrder) ? sortOrder : 'DESC';
    const entityManager = getManager();
    let sql = `
    SELECT books.*, COUNT(*) as reader_count
    FROM books 
    LEFT JOIN book_user ON book_user.book_id = books.id
    GROUP BY books.id
    ORDER BY reader_count {{SORT_ORDER}};`;
    sql = sql.replace('{{SORT_ORDER}}', order);
    return await entityManager.query(sql);
  }
}