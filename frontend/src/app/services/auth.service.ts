// import necessary modules from angular
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators'; 

// Injector decorator makes this service available throughout the app
@Injectable({
  providedIn: 'root' // this service is a singleton available everywhwere
})
export class AuthService {

  // Api URL - this is where our Node.js backend is running
  private  apiUrl = 'http://localhost:3000/api/auth';
  
  // BehaviorSubject to track if user is logged in
  // BehaviorSubject is like a variable that components can 'subscribe' to
  // when it changes, all subscribed components get notified automatically
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  // Observable that components can subscribe to
  // this allows components to reactively update when login state changes
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // HttpClient is injected - Angular's service for making HTTP requests
  constructor(private http: HttpClient){}

  /**
   * Register a new user
   * @param username - User's chosen username
   * @param email - User's email address
   * @param password - User's password
   * @returns Observable<any> - response from backend
   */
  register(username: string, email: string, password: string): Observable<any> {
    // Make Post request to backend /register endpoint
    // sends username, email, password in request body
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      email,
      password
    });
  }

  /** Login user
   * @param username - User's username
   * @param password - User's password
   * @returns Observable<any> - Response contains JWT token
   */
login(username: string, password: string): Observable<any> {
  // Make POST request to backend /login endpoint
  return this.http.post(`${this.apiUrl}/login`, {
    username,
    password
  }).pipe(
    // tap() lets us perform (actions)side effects without changing the response
    // Here we save the token when login is successful
    tap((response: any) => {
      if(response.token) {
        // Only save to localStorage in browser environment
        if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
          // Save JWT token to browser's localStorage
          localStorage.setItem('token', response.token);
          // Save username for display purposes
          localStorage.setItem('username', response.username);
        }
        // Update authentication state to true
        // This notifies all subscribed components that user is now logged in
        this.isAuthenticatedSubject.next(true);
      }
    })
  );
}
  /**
   * Logout user
   * Clears token and updates authentication state
   */
 logout(): void {
  // Only try to access localStorage in browser environment
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    // Remove token from localStorage
    localStorage.removeItem('token');
    // Remove username from localStorage
    localStorage.removeItem('username');
  }
  // Update authentication state to false
  this.isAuthenticatedSubject.next(false);
}

  /**
   * Get the JWT token from localStrorage
   * @returns string / null - The token or null if not found
   */
getToken(): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

  /**
   * Get the username token from localStorage
   * @returns string | null - The username or null 
   */
getUsername(): string | null {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return localStorage.getItem('username');
  }
  return null;
}

  /**
   * Check if user has a token (is logged in)
   * @returns boolean - True if token exists, false otherwise
   */
private hasToken(): boolean {
  // Check if we're in browser environment (not server-side rendering)
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return !!localStorage.getItem('token');
  }
  return false;
}

  /**
   * Check if user is currently authenticated
   * @returns boolean - Current authenticated state
   */
  isLoggedIn(): boolean {
    // returns current value of authentication state
    return this.isAuthenticatedSubject.value;
  }
}
