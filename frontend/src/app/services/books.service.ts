import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


/**
 * Book Interface
 * Defines the structure of a book
 * TypeScript uses this to ensure type safety
 */

export interface Book {
  _id?: string;         //  MangoDB ID (this is optional when creating)
  title: string;        // book title
  author: string;       // Bookk author
  publicationDate: string; // Publication date (ISO string format)
  userId?: string;        // User who owns this book
  createdAt: string;      // When book was created  
}

/**
 * Books Service
 * 
 * Handles all http request related to books
 * Communicates with backend API at /api/books
 */
@Injectable({
  providedIn: 'root' // Available throughout the app
})
export class BooksService {
  private apiUrl = `${environment.apiUrl}/api/books`;

  /**
   * Constructor - Dependency Injection
   * 
   * @param  http - Angular's httpClient for making HTTP requests
   * The JWT token is automatically added by the interceptor
   * SO no need to manually add it here
   */

  constructor(private http: HttpClient) {}

  /**
   * Get All Books
   * 
   * Fetches all books for the logged-in user
   * Backend filters books by userId from JWT token
   * 
   * @returns Observable <Book[]> - Array of books
   */
  getBooks(): Observable<Book[]> {
    // Get request to: http://localhost:300/api/books
    // backend will return only books for current user
    return this.http.get<Book[]>(this.apiUrl);
  }

  /**
   * Get Single Book by ID
   * 
   * Fetches one specific book
   * 
   * @param id - The book's MongoDB_id
   * @returns Observable<Book> - Single book object
   */

  getBook(id: string): Observable<Book> {
    // GET request to: http://localhost:3000/api/books/:id
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create New Book
   * 
   * Sends book data to backend to create new book
   * Backend will add userId automatically from JWT token
   * @param book - Book object with title, author, publicationDate
   * @returns Observable<any> - response from backend
   */
  createBook (book: Book): Observable<any> {
    // POST request to: http://localhost:3000:/api/books
    // Body: {title, author, publicationDate}
    return this.http.post(this.apiUrl, book);
  }

  /**
   * Update existing Book
   * 
   * sends updated book to backend
   * 
   * @param id - The book's MongoDB_id
   * @param book - updated book data
   * @returns Observable<any> - Response from backend
   */
  updateBook(id: string, book: Book): Observable<any> {
    // POST request to: http://localhost:3000/api/books/:id
    //Body: {title, author, publicationDate}
    return this.http.put(`${this.apiUrl}/${id}`, book);
  }

  /**
   * Delete book
   * 
   * Removes book from database
   * 
   * @param id - The book's MongoDB_id
   * @returns Observable<any> - response from backend
   */
  deleteBook(id: string): Observable<any> {
    // Delete request to: http://localhost:3000/api/books/:id
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
