// Import necessary modules from Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BooksService, Book } from '../../services/books.service';
import {  AuthService } from '../../services/auth.service';

/**
 * Bookorm Component
 * Handles both:
 * - Adding new books (when at /books/new)
 * - Editing existing books (when at /books/edit/:id)
 */
@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [
    CommonModule, // for *nfIf
    FormsModule   // for [(ngModel)]
  ],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.css'
})
export class BookFormComponent implements OnInit {

  // Form data
  book: Book = {
    title: '',
    author: '',
    publicationDate: '',
    createdAt: ''
  };
  
  // UI state
  isEditMode: boolean = false;      // Are we editing or creating?
  bookId: string = '';              // ID of book being edited (if edit mode)
  isLoading: boolean = false;       // Loading state during save
  errorMessage: string = '';        // Error messages
  
  /**
   * Constructor - Dependency Injection
   * 
   * @param booksService - Service for book API calls
   * @param authService - Service for authentication
   * @param router - Service for navigation
   * @param route - Service to access route parameters
   */
  constructor(
    private booksService: BooksService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute  // Access URL parameters
  ) {}
  /**
   * ngOnInit - Lifecicle Hook
   * 
   * Runs when component loads
   * Determines if we are in Add or Edit mode
   */
  ngOnInit(): void {
    /**
     * Get 'id' from URL parameters
     * 
     * If URL is /books/edit/123, then id = 123
     * If URl is /books/edit, then id = undefined
     */
    this.bookId = this.route.snapshot.params['id'];

    /**
     * Determines mode based on presence of ID
     * 
     * !! Covers value to boolean:
     * - If bookId exists -> true (Edit mode)
     * - If bookId is undefined -> false (Add mode)
     */
    this.isEditMode = !!this.bookId;

    /**
     * If Edit mode, load existing book data
     */
    if(this.isEditMode){
      this.loadBook();
    }
  }

  /**
   * Load Book Data (Edit Mode only)
   * 
   * Fetches existing book dara from backend
   * Pre-fills the form with current values
   */
  loadBook(): void {
    this.isLoading = true;

    /**
     * Call books service to fetch book by id
     */
    this.booksService.getBook(this.bookId).subscribe({

      /**
       * Success callback
       * 
       * Book data received from backend
       */
      next:(book) =>{
        console.log('Book loaded for editing:', book);
        /**
         * Store book data
         * This will pre-fill the form inputs via [(ngModel)]
         */
        this.book = book;

        /**
         * Format data for HTM input
         * 
         * Backend sends: "2020-01-15T00:00:00.000Z"
         * HTML inout needs: "2020-01-15"
         * Split ('T')[0] takes only the data part
         */
        if(this.book.publicationDate) {
          this.book.publicationDate = this.book.publicationDate.split('T')[0];
        }
        this.isLoading = false;
      },

      /**
       * Error callback
       * 
       * failed to load book
       */
      error:(error) => {
        console.error('Error loading book:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load book. Please try again.';

        /**
         * If book found, go back to book list
         */
        setTimeout(() => {
          this.router.navigate(['/books']);
        }, 2000);
      }
    });
  }

  /**
   * Save book (create or update)
   * 
   * Called whren form is submitted
   * Determines whether to create new book or update existing book
   */
  onSubmit(): void {
    // reset error message
    this.errorMessage = '';

    /**
     * Validation: Check if all fields are filled
     */
    if(!this.book.title.trim() || !this.book.author.trim() || !this.book.publicationDate) {
      this.errorMessage = 'Please fill in all the fields';
      return;
    }
    // show loading state
    this.isLoading = true;

    /**
     * Decide: Create or update
     */
    if (this.isEditMode) {
      // Edit mode: Update existing book
      this.updateBook();
    }else {
      // Add mode: Create a new book
      this.createBook();
    }
  }

  /**
   * Create New Book
   * Sends Post Request to backend
   */
  createBook(): void {
    /**
     * Call books service to create book
     * Sends: {title, author, publicationDate}
     * Backend adds userId automatically from JWT token 
     */
    this.booksService.createBook(this.book).subscribe({

      /**
       * Success callback
       * 
       * Book created in database
       */
      next: (response) => {
        console.log('Book created:', response);
        this.isLoading  = false;

        /**
         * Navigate back to book list
         * user will see their new book in the book list
         */
        this.router.navigate(['/books']);
      },

      /**
       * Error callback
       * Failed to create a new book
       */
      error:(error) => {
        console.error('Error creating book:', error);
        this.errorMessage = error.erro?.message || 'Faileld to create book. Please try again.';
      }
    });
  }

   /**
   * Update Existing Book
   * 
   * Sends PUT request to backend
   */
  updateBook(): void {
    /**
     * Call books service to update book
     * 
     * Sends: Put /api/books/:id with updated data
     */
    this.booksService.updateBook(this.bookId, this.book).subscribe({

      /**
       * Success callback
       * 
       * Book updated in database
       */
      next: (response) => {
        console.log('Book updated', response);
        this.isLoading = false;

        /**
         * Navigate back to book list
         * User gets see their updated book
         */
        this.router.navigate(['/books']);
      },

      /**
       * Error callback
       * Failed to update book
       */
      error:(error) => {
        console.error('Error updating book', error);
        this.errorMessage = error.error?.message || 'Failed to update book. Please try again';
      }
    });
  }

  /**
   * Cancel and go back
   * 
   * Returns to book list without saving
   */
  cancel(): void{
    this.router.navigate(['/books']);
  }

  goToBooks(): void {
    this.router.navigate(['/books']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}