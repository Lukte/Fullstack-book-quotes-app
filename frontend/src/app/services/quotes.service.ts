import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Quote Interface
 * Defines the struture of a quote
 */

export interface Quote {
  _id?: string; // MOngoDB ID (when creating)
  text: string;  // Quote text
  author: string; // Quote author
  userId?: string; // User who owns the quote
  createdAt?: string; // when quote was created
}

/**
 * Quotes service
 * Handles HTTP requests related to quotes
 * Communicates with backend API at /api/quotes
 */

@Injectable({
  providedIn: 'root' // is available throughout the app
})
export class QuotesService {
  private apiUrl = `${environment.apiUrl}/api/quotes`;

  /**
   * Constructor - Dependency Injection
   * @param http - Angular's HttpClient for making HTTP requests
   * The JWT token is automatically added by the interceptor
   */
  constructor(private http: HttpClient) { }

  /**
   * Get All Quotes
   * Fetaches all quotes for the logged-in user (max 5 quotes for each user)
   * Backend filters by UserId from JWT token
   * @returns Observable<Quote[]>- Array of quotes (max 5)
   */
  getQuotes(): Observable<Quote[]> {
    // Get request to: http:localhost:3000/api/quotes
    // backend will return only quotes for current user
    return this.http.get<Quote[]>(this.apiUrl);
  }

  /**
   * Get Single quote by ID
   * Fetches one specific quote
   * @param id - The quote's MongoDb_id
   * @returns Observable<Quote> - Single quote object
   */
  getQuote(id: string): Observable<Quote> {
    // GET request to: http://localhost:3000/api/quotes
    return this.http.get<Quote>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create New Quote
   * Sends quote data to backend to creare bew quote
   * Backend will add userId automatically from JWT token
   * Bacnekd enforces max 5 quotes per user
   * @param quote - object with text and author
   * @returns Observable<any> -response from backend
   */
  createQuote(quote: Quote): Observable<any> {
    // POST request to: http://localhost:3000/api/quotes
    // Body: {text, author}
    return this.http.post(this.apiUrl, quote);
  }

  /**
   * Update Existing quote
   * Sends updated quote to backend
   * @param id - The quote's MongoDB_id
   * @param quote - Updated quote data
   * @returns Observable<any> - response from backend
   */
  updateQuote(id: string, quote: Quote): Observable<any> {
    // PUT request to: http://localhost:3000/api/quotes:id
    return this.http.put(`${this.apiUrl}/${id}`, quote);
  }

  /**
 * Delete Quote
 * Removes quote from database
 * @param id - The quote's MongoDB_id
 * @returns - Observable<any> - response from backend
 */
deleteQuote(id: string): Observable<any> {
  // DELETE resquest to: http://localhost:3000/api/quotes/:id
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}


