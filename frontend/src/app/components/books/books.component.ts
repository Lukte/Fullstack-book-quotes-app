// Import necessary modules from Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BooksService, Book } from '../../services/books.service';
import { AuthService } from '../../services/auth.service';
/**
 * Books COmponent
 * 
 * Main page showing list of user's books
 * Allows viewing, adding, editing and deleting books
 */
@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule],  // For *ngIf, *ngFor
  templateUrl: './books.component.html',
  styleUrl: './books.component.css'
})
export class BooksComponent implements OnInit {

  /**
   * Component Properties
   */
  books: Book[] = [];      // Array to store all books
  isLoading: boolean = false; // Loading state
  errorMessage: string = '';    // Error messages
  username: string = '';  
  successMessage: string = '';      // current user's name

  /**
   * Constructor - Dependency Injection
   * @param booksService - Service to handle book API calls
   * @param authService - Service to handle authentication
   * @param router - Service for navidation
   */
  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private router: Router
  ){}

  /**
   * ngOnInit - Lifecycle Hook
   * 
   * Runs automatically when component loads
   *
   * We use this to:
   * 1. Get username
   * 2. Load books from backend
   */
  ngOnInit(): void {
    // Get username from Auth Service
    this.username = this.authService.getUsername() || 'user';
    // Load books when component initializes
    this.loadBooks();
  }

  /**
   * Load books from backend
   * 
   * Fetches all books for the loggned-in user
   * Displays loading state and handles errors
   */
  loadBooks(): void {
    // Show loading spinner
    this.isLoading = true;
    this.errorMessage = '';

    /**
     * Call books service to ftech books
     * 
     * The service makes HTTP Get Request to:
     * http://localhost:3000/api/books
     * 
     * Backend returns only books for current user
     * (filtered by userId from JWT token)
     */
    this.booksService.getBooks().subscribe({

      /**
       * Success callBack
       * 
       * Runs when books are successfully fetched 
       */
      next: (books) => {
        console.log('Books loaded', books);
        // store books in component property
        this.books = books;
        // Hide loading spinner
        this.isLoading = false;
      },

      /**
       * Error callback
       * 
       * Runs when there's an error fetching books
       * Could be: netwrok error, error server, unauthorized, etc
       */
      error: (error) => {
        console.log('Error loading books: ', error);
        // Hide loading spinner
        this.isLoading = false;
        
        /**
         * Handle different error types
         */
        if(error.status === 401 || error.status === 403){
          // Unauthorized - token expired or invalid
          this.errorMessage = 'Session expired. Please login again';
          // Loguot and redirect to login
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        }else{
          // other erros (network, server, etc)
          this.errorMessage = ('Failed to load books. Please try again.');
        }
      }
    });
  }

  /**
   * Navigate to Add book page
   * Takes user to form to create new book
   */
  addBook(): void {
    this.router.navigate(['/books/new']);
  }

  /**
   * Navigate to edit book page
   * Takes user to form to edit existing book
   * @param bookId - The MongoDB_id of the book to edit
   */
  editBook(bookId: string): void {
    this.router.navigate(['/books/edit', bookId]);
  }

  /**
   * Delete Book
   * Romoves book from datbase after confirmation
   * @param book - The book object to delete
   */
  deleteBook(book: Book): void {
    /**
     * Confirm before deleting
     * window.confirm() shows browser's native confirm dialog
     * Ruturns true if user clicks "ok", false if "cancel"
     */
    const confirmed = window.confirm(
      'Are you sure you want to delete."${book.title}" by ${book.author}?'
    );

    if(!confirmed) {
      return;
    }
    /**
     * User confirmed - proceed with deletion
     */
    this.isLoading = true;

    /**
     * Calls books service to delete book
     * Sends DELETE request to:
     * http://localhost:3000/api/books/:id
     */
    this.booksService.deleteBook(book._id!).subscribe({

      /**
       * Success callback
       */
      next:(reponse) => {
        console.log('Book deleted:', reponse);
        
        /**
         * Remove book from local array
         * filter() creates new array without the deleted book
         * This updates the UI immediately without reloading
         */
        this.books = this.books.filter(b => b._id !== book._id);

        // Hide the loading spinner
        this.isLoading = false;
      },
      /**
       * Error callback
       * Failed to delete book
       */
      error: (error) => {
        console.log('Error deleting book:', error);
        // Hide the loading spinner
        this.isLoading = false;
        // show error message
        this.errorMessage = 'Failed to delete book.Please try again.';
        // clear error messages after 3 seconds
        setTimeout(() => {
          this.errorMessage ='';
        }, 3000);
      }
    });
  }

  /**
   * Logout User
   * Clears token and redirects to login page
   */
  logout(): void {
    // clear token from local storage
    this.authService.logout();

    // navigate to login page
    this.router.navigate(['/login']);
  }

  /**
   * Naviate to quotes page
   * Takes user to quotes management page
   */
  goToQuotes(): void {
    this.router.navigate(['/quotes']);
  }
}
