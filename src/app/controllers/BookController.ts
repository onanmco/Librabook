import { Request, Response } from 'express';
import {
  REST_CONTROLLER,
  HTTP_GET,
} from '../../core/decorators';
import { Book } from '../entities/Book';

@REST_CONTROLLER('/books')
class BookController {
  @HTTP_GET('/getall')
  public async getAllBooks(req: Request, res: Response) {
    return res.status(200).json(await Book.find());
  }
}