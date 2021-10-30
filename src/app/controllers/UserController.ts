import { Response } from 'express';
import {
  HTTP_POST,
  USE_MIDDLEWARE,
  REST_CONTROLLER,
  HTTP_GET,
  HTTP_DEL
} from '../../core/decorators';
import bodyParser from 'body-parser';
import { requiresAuth } from '../middlewares/requiresAuth';
import * as Yup from 'yup';
import bcrypt from 'bcrypt';
import { RequestWithAuthProp } from '../../core/types/RequestWithAuthProp';
import Errors from "../constants/Errors";
import { User } from "../entities/User";
import { Book } from '../entities/Book';
import { StatusCodes } from '../constants/StatusCodes';
import { Groups } from '../constants/Groups';
import { Group } from '../entities/Group';
import _ from 'lodash';
import { Auth } from '../helpers/Auth';
import { User as AuthUser} from '../gates/User';

/**
 * Class UserController
 * Responsible for processing and responding to requests, related to Users.
 */
@REST_CONTROLLER('/users')
class UserController {
  /**
   * Method that allows users to create new accounts.
   * 
   * There are two groups of users and several roles associated with them.
   * User groups identified by the group_id column on the users table.
   * 
   * Guests can only create CONSUMER group users which they can only.
   * read books, update their book collections, etc. CONSUMER group does NOT have administrational roles.
   * So even if a guest pass a field as it specifies the group as ROOT, it will be ignored and the
   * requested user will be created with CONSUMER group rights.
   * 
   * To create ROOT users with administrational rights, you must be a logged in ROOT user.
   * 
   * @param {Request} req 
   * @param {Response} res 
   * @returns void
   */
  @HTTP_POST('/')
  @USE_MIDDLEWARE(bodyParser.json())
  public async create(req: RequestWithAuthProp, res: Response) {
    const requestedUser = new Auth(req);
    const isRoot: boolean = (await requestedUser.isAuth()) && AuthUser.canCreateRootUser(requestedUser.getAuthToken().user);
    const groups = _.keyBy(await Group.find(), 'name');

    let validationRules = {
      first_name: Yup.string()
        .min(1)
        .max(255)
        .matches(
          // eslint-disable-next-line
          /^[a-zA-Z\s.'\-]*$/,
          Errors.NAME_CHARSET('first_name')
        )
        .required(),
      last_name: Yup.string()
        .min(1)
        .max(255)
        .matches(
          /^[a-zA-Z\s.'\-]*$/,
          Errors.NAME_CHARSET('last_name')
        )
        .required(),
      password: Yup.string()
        .min(8)
        .max(20)
        .matches(
          /[A-Z]/,
          Errors.UPPERCASE_RULE('password', 1)
        )
        .matches(
          /\d/,
          Errors.DIGIT_RULE('passsword', 1)
        )
        .matches(
          // eslint-disable-next-line
          /^[@!^+%\/()=?_*\-<>#$½{\[\]}\\|\w]*$/,
          Errors.PASSWORD_CHARSET('password')
        )
        .required(),
      email: Yup.string()
        .email()
        .required()
    } as Record<string, any>;

    if (isRoot) {
      validationRules.group =
        Yup.string()
        .oneOf(Object.keys(groups))
    }

    const schema = Yup.object(validationRules);

    try {
      schema.validateSync(req.body, { abortEarly: false })
    } catch ({ errors }) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({ errors: errors });
    }

    const existing_user = await User.findOne({
      where: {
        email: req.body.email
      }
    });

    if (existing_user) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({ errors: [Errors.EMAIL_ALREADY_TAKEN] });
    }

    let groupId = null;

    if (isRoot && req.body.group) {
      groupId = groups[req.body.group].id;
    } else {
      groupId = groups[Groups.CONSUMER].id;
    }

    const user = User.create({
      group_id: groupId,
      email: req.body.email,
      password_hash: bcrypt.hashSync(req.body.password, 10),
      first_name: req.body.first_name,
      last_name: req.body.last_name
    });

    await user.save();
    res.status(StatusCodes.HTTP_OK).json(user);
  }

  /**
   * Method that returns all the books in the bookshelf of a user.
   * 
   * @param {RequestWithAuthProp} req 
   * @param {Response} res 
   */
  @HTTP_GET('/:userId/books')
  @USE_MIDDLEWARE(requiresAuth)
  public async getAllBooksOfUser(req: RequestWithAuthProp, res: Response) {
    const schema = Yup.object({
      userId: Yup.number()
        .required()
    });

    try {
      schema.validateSync(req.params, { abortEarly: false })
    } catch ({ errors }) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({ errors: errors });
    }

    const user = await User.findOne({
      where: {
        id: req.params.userId
      }
    });

    if (! user) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({
        errors: [ `User with id ${req.params.userId} could not be found.` ]
      });
    }

    return res.status(StatusCodes.HTTP_OK).json(await user.getBooks())
  }

  /**
   * Method that adds a particular book to the bookshelf of the logged in user.
   * 
   * @param req 
   * @param res 
   */
  @HTTP_POST('/:userId/books/:bookId')
  @USE_MIDDLEWARE(requiresAuth)
  public async addBookToUsersBookshelf(req: RequestWithAuthProp, res: Response) {
    const schema = Yup.object({
      userId: Yup.number()
      .required(),
      bookId: Yup.number()
      .required()
    });
    
    try {
      schema.validateSync(req.params, { abortEarly: false })
    } catch ({ errors }) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({ errors: errors });
    }
    
    const user = req.auth.token.user;

    if (user.id != parseInt(req.params.userId)) {
      return res.sendStatus(StatusCodes.HTTP_NOT_FOUND);
    }
    
    const bookId = req.params.bookId;
    
    const existingBook = await Book.findOne({ id: parseInt(bookId) });
    
    if (! existingBook) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({
        errors: [ `Could not find the book with id: ${bookId}` ]
      });
    }

    if (await user.hasBook(existingBook)) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({
        errors: [ `You already have the book with id of ${req.params.bookId} in your bookshelf.` ]
      })
    }

    await user.attachBook(existingBook);

    res.status(StatusCodes.HTTP_OK).json(existingBook);
  }

  /**
   * Method that removes a particular book from the bookshelf of the logged in user.
   * 
   * @param req 
   * @param res 
   */
  @HTTP_DEL('/:userId/books/:bookId')
  @USE_MIDDLEWARE(requiresAuth)
  public async removeBookFromUsersBookshelf(req: RequestWithAuthProp, res: Response) {
    const schema = Yup.object({
      userId: Yup.number()
      .required(),
      bookId: Yup.number()
      .required()
    });
    
    try {
      schema.validateSync(req.params, { abortEarly: false })
    } catch ({ errors }) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({ errors: errors });
    }
    
    const user = req.auth.token.user;

    if (user.id != parseInt(req.params.userId)) {
      return res.sendStatus(StatusCodes.HTTP_NOT_FOUND);
    }
    
    const bookId = req.params.bookId;

    const existingBook = await Book.findOne({ id: parseInt(bookId) });
    
    if (! existingBook) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({
        errors: [ `Could not find the book with id: ${bookId}` ]
      });
    }

    if (! await user.hasBook(existingBook)) {
      return res.status(StatusCodes.HTTP_BAD_REQUEST).json({
        errors: [ `You don't have the book with id: ${bookId}` ]
      });
    }

    await user.detachBook(existingBook);

    return res.sendStatus(StatusCodes.HTTP_OK);
  }
}