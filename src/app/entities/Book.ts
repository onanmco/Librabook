import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, OneToMany, JoinColumn, Unique, getManager, getConnection } from 'typeorm';
import { BookUser } from './BookUser';
import * as utils from '../../utils';
import { SortOrder } from '../types/QueryParams';
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
    const connection = await getConnection();
    const tableName = utils.getTableName(connection, this);
    const junctionTableName = utils.getJunctionTableName([ Book, User ]);
    const columnNames = utils.getTableColumns(connection, this);
    const allowedOrderKeywords = Object.keys(SortOrder).map(order => SortOrder[order]);

    let select = `SELECT ${tableName}.*`;
    let from = ` FROM ${tableName}`;
    let join = '';
    let groupBy = '';
    let orderBy = '';

    const isSortCriteriaATableColumn = columnNames.includes(sortCriteria);
    const isValidOrderSpecified = allowedOrderKeywords.includes(sortOrder);

    if (isSortCriteriaATableColumn) {
      orderBy = ` ORDER BY ${sortCriteria} ${isValidOrderSpecified ? sortOrder : SortOrder.DESC}`;
    } else if (isValidOrderSpecified) {
      const aggregateCriteria = 'readers_count';
      select = `${select}, COUNT(user_id) AS ${aggregateCriteria}`;
      join = ` LEFT JOIN ${junctionTableName} ON ${junctionTableName}.book_id = books.id`;
      groupBy = ' GROUP BY books.id';
      orderBy = ` ORDER BY ${aggregateCriteria} ${sortOrder}`;
    }

    const sql = `${select}${from}${join}${groupBy}${orderBy};`;
    const entityManager = getManager();
    return await entityManager.query(sql);
  }
}