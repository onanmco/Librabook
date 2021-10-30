export class Roles {
  public static readonly CREATE_BOOK = 'CREATE_BOOK';
  public static readonly UPDATE_BOOK = 'UPDATE_BOOK';
  public static readonly DELETE_BOOK = 'DELETE_BOOK';

  public static readonly ADD_BOOK_TO_BOOKSHELF = 'ADD_BOOK_TO_BOOKSHELF';
  public static readonly UPDATE_BOOK_AT_BOOKSHELF = 'UPDATE_BOOK_AT_BOOKSHELF';
  public static readonly DELETE_BOOK_FROM_BOOKSHELF = 'DELETE_BOOK_FROM_BOOKSHELF';

  public static readonly CREATE_ROOT_USER = 'CREATE_ROOT_USER';
  public static readonly UPDATE_ROOT_USER = 'UPDATE_ROOT_USER';
  public static readonly DELETE_ROOT_USER = 'DELETE_ROOT_USER';

  public static readonly UPDATE_CONSUMER_USER = 'UPDATE_CONSUMER_USER';
  public static readonly DELETE_CONSUMER_USER = 'DELETE_CONSUMER_USER';

  public static getRootRoles(): string[] {
    return [
      Roles.CREATE_BOOK,
      Roles.UPDATE_BOOK,
      Roles.DELETE_BOOK,

      Roles.CREATE_ROOT_USER,
      Roles.UPDATE_ROOT_USER,
      Roles.DELETE_ROOT_USER,

      Roles.UPDATE_CONSUMER_USER,
      Roles.DELETE_CONSUMER_USER,
    ];
  }

  public static getConsumerRoles(): string[] {
    return [
      Roles.ADD_BOOK_TO_BOOKSHELF,
      Roles.UPDATE_BOOK_AT_BOOKSHELF,
      Roles.DELETE_BOOK_FROM_BOOKSHELF,
      Roles.UPDATE_CONSUMER_USER,
    ];
  }

  public static getAllRoles(): string[] {
    return [
      Roles.CREATE_BOOK,
      Roles.UPDATE_BOOK,
      Roles.DELETE_BOOK,

      Roles.ADD_BOOK_TO_BOOKSHELF,
      Roles.UPDATE_BOOK_AT_BOOKSHELF,
      Roles.DELETE_BOOK_FROM_BOOKSHELF,

      Roles.CREATE_ROOT_USER,
      Roles.UPDATE_ROOT_USER,
      Roles.DELETE_ROOT_USER,

      Roles.UPDATE_CONSUMER_USER,
      Roles.DELETE_CONSUMER_USER,
    ];
  }
}