import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, JoinColumn, Unique, getManager } from 'typeorm';
import { Sortable } from '../types/Sortable';
import { BookUser } from './BookUser';
import * as utils from '../../utils';
import { SortOrder } from '../types/QueryParams';
@Entity({
  name: 'books'
})
@Unique(['content'])
export class Book extends BaseEntity implements Sortable{
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

  public static async getAllBooks(sortCriteria = null, sortOrder = null): Promise<Book[]> {
    let select = 'SELECT books.*';
    let from = ' FROM books';
    let join = '';
    let groupBy = '';
    let orderBy = '';

    const isSortCriteriaATableColumn = (await utils.getTableColumns(Book)).includes(sortCriteria);
    const isValidOrderSpecified = Object.keys(SortOrder).map(o => SortOrder[o]).includes(sortOrder);

    let params = [];

    if (isSortCriteriaATableColumn) {
      orderBy = ` ORDER BY ${sortCriteria} ${isValidOrderSpecified ? sortOrder : SortOrder.DESC}`;
    } else if (isValidOrderSpecified) {
      const aggregateCriteria = 'readers_count';
      select = `${select}, COUNT(*) AS ${aggregateCriteria}`;
      join = ' LEFT JOIN book_user ON book_user.book_id = books.id';
      groupBy = ' GROUP BY books.id';
      orderBy = ` ORDER BY ${aggregateCriteria} ${sortOrder}`;
    }

    const sql = `${select}${from}${join}${groupBy}${orderBy};`;
    const entityManager = getManager();
    return await entityManager.query(sql);
  }
}