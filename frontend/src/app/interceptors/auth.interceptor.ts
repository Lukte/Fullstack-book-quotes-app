import { HttpInterceptorFn } from '@angular/common/http';

/**
 * HTTP interceptor for Authentication
 * 
 * What is an Interceptor?
 * - it "intercepts" every HTTP request before it's sent
 * - Allows us to modify requests (like adding headers)
 * - in this case: automatically adds JWT token to every request
 * 
 * Why do we need this?
 * - Without it, we'd have to manually add the token to Every API call
 * - with it, the token is automatically added everywhere 
 */

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /**
   * Step 1: Get the JWT from localStorage
   * 
   * Check if we're in browser environment first (SSR safe)
   * localStorage is only available in the browser, not on the server
   */

  // Check if we're in browser environment
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('token');

    /**
     * Step 2: check if token exists
     * 
     * If token exists, we clone the request and add Authorization header
     */
    if (token) {
      /**
       * Clone the original request and add Authorization header
       * 
       * Why clone?
       * - HTTP requests are immutable (can't be changed)
       * - We must create a new request with our modifications
       * 
       * What does this do?
       * - takes the original request (req)
       * - Creates a copy with added header
       * - Header format: "Authorization: Bearer <token>"
       * 
       * Why Bearer?
       * - JWT standard requires "Bearer" prefix
       * - Backend expects: "Bearer eyJhbGc..."
       */

      const cloneRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}` // add token
        }
      });

      /**
       * Step 3: Send the modified request
       * 
       * next() passes the request to the next handler in the chain
       * This could be another interceptor or the actual HTTP call
       */
      return next(cloneRequest);
    }
  }

  /**
   * If no token exists or not in browser environment, send original request unchanged
   * 
   * This happens:
   * - On login/register pages (no token yet)
   * - When user is not logged in
   * - During server-side rendering
   */
  return next(req);
};