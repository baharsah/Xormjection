import { StatusCodes as status } from 'http-status-codes'

import { ModelBook } from '../models/model.book'
import { IServiceBook, IBook } from '../interfaces/interface.book'
import { Request } from '../helpers/helper.generic'

export class ServiceBook extends ModelBook implements IServiceBook {
  async createServiceBook(req: Request<IBook>): Promise<Record<string, any>> {
    try {
      const checkBook = await this.model().query().where({ isbn: req.body.isbn }).first()

      if (checkBook) {
        throw { code: status.CONFLICT, message: 'Book isbn already exist' }
      }

      const addBook = await this.model().query().insert(req.body).first()

      if (!addBook) {
        throw { code: status.FORBIDDEN, message: 'Created new book failed' }
      }

      return Promise.resolve({ code: status.CREATED, message: 'Created new book success' })
    } catch (e: any) {
      return Promise.reject({ code: e.code, message: e.message })
    }
  }

  async resultsServiceBook(): Promise<Record<string, any>> {
    try {
      const getBooks = await super
        .model()
        .query()
        .select('book.*', 'book.id as bookId', 'author.*', 'author.id as authorId')
        .join('author', 'author.id', 'book.author_id')
        .orderBy('book.created_at', 'asc')

      if (!getBooks.length) {
        throw { code: status.NOT_FOUND, message: 'Books data not found' }
      }

      const newBooks = getBooks.map((val: Record<string, any>) => {
        return {
          id: val.bookId,
          name: val.name,
          isbn: val.isbn,
          release: val.release,
          publisher: val.publisher,
          author: {
            id: val.author_id,
            first_name: val.first_name,
            last_name: val.last_name,
            place_of_birth: val.place_of_birth,
            date_of_birth: val.date_of_birth
          },
          created_at: val.created_at,
          updated_at: val.updated_at
        }
      })

      return Promise.resolve({ code: status.OK, message: 'Books data already to use', books: newBooks })
    } catch (e: any) {
      return Promise.reject({ code: e.code, message: e.message })
    }
  }

  async resultServiceBook(req: Request<IBook>): Promise<Record<string, any>> {
    try {
      const getBook = await super
        .model()
        .query()
        .select('book.*', 'book.id as bookId', 'author.*')
        .join('author', 'author.id', 'book.author_id')
        .where('book.id', req.params.id)
        .first()

      if (!getBook) {
        throw { code: status.NOT_FOUND, message: `Book data not found, for this id ${req.params.id}` }
      }

      const newBook: Record<string, any> = {
        id: getBook['bookId'],
        name: getBook.name,
        isbn: getBook.isbn,
        release: getBook.release_date,
        publisher: getBook.publisher,
        author: {
          id: getBook.author_id,
          first_name: getBook['first_name'],
          last_name: getBook['last_name'],
          place_of_birth: getBook['place_of_birth'],
          date_of_birth: getBook['date_of_birth']
        },
        created_at: getBook.created_at,
        updated_at: getBook.updated_at
      }

      return Promise.resolve({ code: status.OK, message: 'Book data already to use', book: newBook })
    } catch (e: any) {
      return Promise.reject({ code: e.code, message: e.message })
    }
  }

  async deleteServiceBook(req: Request<IBook>): Promise<Record<string, any>> {
    try {
      const getBook = await this.model().query().findById(req.params.id)

      if (!getBook) {
        throw { code: status.NOT_FOUND, message: `Book data not found, for this id ${req.params.id}` }
      }

      const deleteBook = await this.model().query().deleteById(req.params.id)

      if (!deleteBook) {
        throw { code: status.FORBIDDEN, message: 'Deleted book data failed' }
      }

      return Promise.resolve({ code: status.OK, message: 'Deleted book data success' })
    } catch (e: any) {
      return Promise.reject({ code: e.code, message: e.message })
    }
  }

  async updateServiceBook(req: Request<IBook>): Promise<Record<string, any>> {
    try {
      const checkBook = await this.model().query().findById(req.params.id)

      if (!checkBook) {
        throw { code: status.NOT_FOUND, message: `Book data not found, for this id ${req.params.id}` }
      }

      const updateBook = await this.model().query().updateAndFetchById(req.params.id, req.body)

      if (!updateBook) {
        throw { code: status.FORBIDDEN, message: 'Updated book data failed' }
      }

      return Promise.resolve({ code: status.CREATED, message: 'Updated book data success' })
    } catch (e: any) {
      return Promise.reject({ code: e.code, message: e.message })
    }
  }
}