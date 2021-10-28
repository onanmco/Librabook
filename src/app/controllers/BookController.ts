import { query, Request, Response } from 'express';
import {
  REST_CONTROLLER,
  HTTP_GET,
} from '../../core/decorators';
import { Book } from '../entities/Book';

@REST_CONTROLLER('/books')
class BookController {
  @HTTP_GET('/')
  public async getAllBooks(req: Request, res: Response) {
    const sortOrder = req.query.sort;

    if (! sortOrder) {
      return res.status(200).json(await Book.find());
    }
    
    res.status(200).json(await Book.getAllBooksSortedByReadingRate(sortOrder as string));
  }
}