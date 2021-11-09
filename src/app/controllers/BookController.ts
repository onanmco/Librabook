import {NextFunction, Request, Response} from 'express';
import {
  REST_CONTROLLER,
  HTTP_GET,
} from '../../core/decorators';
import { StatusCodes } from '../constants/StatusCodes';
import { Book } from '../entities/Book';

/**
 * Class BookController
 * Responsible for processing and responding to requests, related to Book entity.
 */
@REST_CONTROLLER('/books')
class BookController {
  /**
   * Method to get all available books on the system.
   * 
   * If a sort criteria that also matches with any of the books table columns is specfied as a query param,
   * results will be sorted according to this field.
   * e.g. GET /books?sort=page_count&order=desc => results will be sorted according to page count in descending order.
   * 
   * If there is no sort criteria speficied however a sort order specified,
   * results will be sorted according to reader count of the books.
   * 
   * Other than above mentioned, you can apply pagination by specifying limit and offset query params.
   * 
   * @param {Request} req 
   * @param {Response} res 
   */
  @HTTP_GET('/')
  public async getAllBooks(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(StatusCodes.HTTP_OK)
        .json(await Book.getAllBooks({
            sortCriteria: req.query.sort ? String(req.query.sort) : null,
            sortOrder: req.query.order ? String(req.query.order) : null,
            limit: req.query.limit ? parseInt(String(req.query.limit)) : null,
            offset: req.query.offset ? parseInt(String(req.query.offset)) : null
        }));
    } catch (err) {
      next(err);
    }
  }
}