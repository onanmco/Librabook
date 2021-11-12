import {NextFunction, Request, Response} from 'express';
import {
  REST_CONTROLLER,
  HTTP_GET, HTTP_POST, USE_MIDDLEWARE, HTTP_DEL, HTTP_PUT
} from '../../core/decorators';
import { StatusCodes } from '../constants/StatusCodes';
import { Book } from '../entities/Book';
import {User as AuthUser} from "../gates/User";
import {CustomErrorBuilder} from "../../core/types/CustomErrorBuilder";
import Errors from "../constants/Errors";
import {RequestWithAuthProp} from "../../core/types/RequestWithAuthProp";
import { requiresAuth } from "../middlewares/requiresAuth";
import * as Yup from "yup";
import bodyParser from "body-parser";

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
            offset: req.query.offset ? parseInt(String(req.query.offset)) : null,
            search_term: req.query.search_term ? String(req.query.search_term) : null
        }));
    } catch (err) {
      next(err);
    }
  }

  @HTTP_POST("/")
  @USE_MIDDLEWARE(requiresAuth)
  @USE_MIDDLEWARE(bodyParser.json())
  public async createBook(req: RequestWithAuthProp, res: Response, next: NextFunction) {
    try {
      const authUser = new AuthUser(req.auth.user);

      if (! authUser.canCreateBook()) {
        new CustomErrorBuilder(Errors.UNAUTHORIZED_ACCESS)
          .status(StatusCodes.HTTP_UNAUTHORIZED)
          .dispatch();
      }

      const schema = Yup.object({
        name: Yup.string()
          .required(),
        author: Yup.string()
          .required(),
        content: Yup.string()
          .required()
      });

      try {
        schema.validateSync(req.body, { abortEarly: false })
      } catch ({ errors }) {
        new CustomErrorBuilder(Errors.VALIDATION_ERROR).details(errors).dispatch();
      }

      const existingBook = await Book.findOne({
        where: {
          content: req.body.content
        }
      });

      if (!!existingBook) {
        new CustomErrorBuilder(`Book with content ${req.body.content} is already exists.`)
          .status(StatusCodes.HTTP_UNAUTHORIZED)
          .dispatch();
      }

      const insertedBook = await Book.create({
        name: req.body.name,
        author: req.body.author,
        content: req.body.content
      }).save();

      res.status(StatusCodes.HTTP_OK).json(insertedBook);
    } catch (err) {
      next(err);
    }
  }


  @HTTP_DEL("/:bookId")
  @USE_MIDDLEWARE(requiresAuth)
  public async deleteBook(req: RequestWithAuthProp, res: Response, next: NextFunction) {
    try {
      const authUser = new AuthUser(req.auth.user);

      if (! authUser.canDeleteBook()) {
        new CustomErrorBuilder(Errors.UNAUTHORIZED_ACCESS)
          .status(StatusCodes.HTTP_UNAUTHORIZED)
          .dispatch();
      }

      const schema = Yup.object({
        bookId: Yup.number()
          .required()
      });

      try {
        schema.validateSync(req.params, { abortEarly: false })
      } catch ({ errors }) {
        new CustomErrorBuilder(Errors.VALIDATION_ERROR)
          .details(errors)
          .dispatch();
      }

      const existingBook = await Book.findOne({
        where: {
          id: req.params.bookId
        }
      });

      if (!!!existingBook) {
        new CustomErrorBuilder(`Book with id ${req.params.bookId} could not be found.`)
          .status(StatusCodes.HTTP_NOT_FOUND)
          .dispatch();
      }

      await existingBook.remove();

      res.sendStatus(StatusCodes.HTTP_OK);
    } catch (err) {
      next(err);
    }
  }

  @HTTP_PUT("/:bookId")
  @USE_MIDDLEWARE(requiresAuth)
  public async updateBook(req: RequestWithAuthProp, res: Response, next: NextFunction) {
    try {
      const authUser = new AuthUser(req.auth.user);

      if (! authUser.canUpdateBook()) {
        new CustomErrorBuilder(Errors.UNAUTHORIZED_ACCESS)
          .status(StatusCodes.HTTP_UNAUTHORIZED)
          .dispatch();
      }

      const schema = Yup.object({
        bookId: Yup.number()
          .required()
      });

      try {
        schema.validateSync(req.params, { abortEarly: false })
      } catch ({ errors }) {
        new CustomErrorBuilder(Errors.VALIDATION_ERROR)
          .details(errors)
          .dispatch();
      }

      const existingBook = await Book.findOne({
        where: {
          id: req.params.bookId
        }
      });

      if (!!!existingBook) {
        new CustomErrorBuilder(`Book with id ${req.params.bookId} could not be found.`)
          .status(StatusCodes.HTTP_NOT_FOUND)
          .dispatch();
      }

      existingBook.name = req.body.name ? req.body.name : existingBook.name;
      existingBook.author = req.body.author ? req.body.author : existingBook.author;
      existingBook.content = req.body.content ? req.body.content : existingBook.content;

      await existingBook.save();

      res.status(StatusCodes.HTTP_OK)
        .json(existingBook);
    } catch (err) {
      next(err);
    }
  }

  @HTTP_GET("/:bookId")
  public async getBookDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = Yup.object({
        bookId: Yup.number()
          .required()
      });

      try {
        schema.validateSync(req.params, { abortEarly: false })
      } catch ({ errors }) {
        new CustomErrorBuilder(Errors.VALIDATION_ERROR)
          .details(errors)
          .dispatch();
      }

      const existingBook = await Book.findOne({
        where: {
          id: req.params.bookId
        }
      });

      if (!!!existingBook) {
        new CustomErrorBuilder(`Book with id ${req.params.bookId} could not be found.`)
          .status(StatusCodes.HTTP_NOT_FOUND)
          .dispatch();
      }

      return res.status(StatusCodes.HTTP_OK)
        .json(existingBook);
    } catch (err) {
      next(err);
    }
  }
}