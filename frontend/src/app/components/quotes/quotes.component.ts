import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuotesService, Quote } from '../../services/quotes.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

/**
 * Quotes component
 * Displays user's five favorite quotes (Max 5)
 * Allows viewing, adding, editing and deleting quotes
 */
@Component({
  selector: 'app-quotes',
  standalone: true,
  imports: [CommonModule], // for *ngIf, *ngFor
  templateUrl: './quotes.component.html',
  styleUrl: './quotes.component.css'
})
export class QuotesComponent implements OnInit {
  /**
   * Component Properties
   */
  quotes: Quote[] = []; // Array to store all quotes
  isLoading: boolean = false; // loading state
  errorMessage: string = ''; // Error messages
  successMessage: string = ''; // Success messages
  username: string = ''; // Current user name
  canAddMore: boolean = true; // Check if user can add more quotes
  isDarkMode: boolean = false;

  /**
   * Constructor - Dependecy Injection
   * @param quotesService - Service to handle quote API calls
   * @param authService - Service to handle authentication
   * @param router - Service for navigation
   */
  constructor (
    private quotesService: QuotesService,
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService
  ) {}

/**
 * ngOnInit - Lifecycle Hook
 * Runs automatically when components loads
 * We use this to:
 * 1. Get username
 * 2. Load quotes from backend
 */
ngOnInit(): void {
  // Get username from Auth Service
  this.username = this.authService.getUsername() || 'user';

  // Subscribe to theme changes
  this.themeService.isDarkMode$.subscribe(isDark => {
    this.isDarkMode = isDark;
  });
  // loads quotes when component initializes
  this.loadQuotes();
}

/**
 * Loads quotes form backend
 * Fetches all quotes for the logged-in user (max 5)
 * Displays loading state and handles errors
 */
loadQuotes(): void {
  // show loading spinner
  this.isLoading = true;
  this.errorMessage = '';

  /**
   * Calls quotes service to fetch quotes
   * The service makes HTTPO GET request to:
   * http://localhost:3000/api/quotes
   * Backend returns onlt quotes for the current user (max 5)
   * (flteted by userId from JWT token) 
   */
  this.quotesService.getQuotes().subscribe({
    /**
     * Success clalback
     * Runs when quotes are successfully fetched
     */
    next: (quotes) => {
      console.log('Quotes loaded:', quotes);
      //Store quotes in component property
      this.quotes = quotes;
      // check if user can add more quotes (max 5)
      this.canAddMore = quotes.length < 5;
      // hide loading spinner
      this.isLoading = false; 
    },
    /**
     * Error callback
     * Runs when there's an error fetching quotes
     * Could be: network error, server error, unauthorized, etc.
     */
    error: (error) => {
      console.error('Error loading quotes', error);
      // hide loadin state
      this.isLoading = false;

      /**
       * Handle different error types
       */
      if(error.status === 401 || error.status === 403) {
        // unauthorized - token expired or invalid
        this.errorMessage = 'session expired. Please login again';
        // Logout and redirect to login page
        setTimeout(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        }, 2000); 
      } else{
        // other errors (network, server, etc.)
        this.errorMessage = ('Failed to load quotes. Please try agaiin.');
      }
    }
  });
}

/**
 * Navigate to Add Quote page
 * Takes user to form to create new quote
 */
addQuote(): void {
  if(this.quotes.length >= 5){
    this.errorMessage ='You can only have 5 quotes. Please delete one to add a new quote';
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
    return;
  }
  this.router.navigate(['/quotes/new']);
}

/**
 * Navigate to Edit quote page
 * Takes user to form to edit existing quote
 * @param quoteId - The MongoDB_id of the quote
 */
editQuote(quoteId: string): void {
  this.router.navigate(['/quotes/edit', quoteId]);
}

/**
 * Delere Quote
 * Removes quote from database after comfirmation
 * @param quote - The quote object to delete
 */
deleteQuote(quote: Quote): void {
  /**
   * Comfirm before deleting
   * window.comfirm() shows browser'snative comfirm dialog
   * Returns true if user clicks "ok" false if cancel
   */
  const confirmed = window.confirm(
    `Are you sure you want to delete the quote by ${quote.author}?`
  );
  if(!confirmed){
    return;
  }

  /**
   * User confirmed the deletion of the quote
   */
  this.isLoading = true;

  /**
   * call quotes service to delete quote
   * Sends DELETE request to:
   * http://localhost:3000/api/quotes/:id
   */
  this.quotesService.deleteQuote(quote._id!).subscribe({

    /**
     * Success callback
     */
    next:(response) => {
      /**
       * Remove quote from local array
       * filter() creates new array without the deleted quote
       * Thus updates the UI immediately without reloading
       */
      this.quotes = this.quotes.filter(q => q._id !== quote._id);

      // Update canAddMore flag
      this.canAddMore = this.quotes.length < 5;
      // hide the loading spinner
      this.isLoading = false;

      // show success messages
      this.successMessage = 'Quote deleted!';
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },

    /**
     * Error callback
     */
    error: (error) => {
      console.error('Error deleting quote:', error);
      // hide the loading state
      this.isLoading = false;
      // show error message
      this.errorMessage = 'Could not delete quote. Try again';
      // clear error message after 3 seconds
      setTimeout(() => {
        this.errorMessage = '';
      }, 3000);
    }
  })
  
}

/**
 * Navigate to Books page
 * Takes user to books management page
 */
goToBooks(): void {
  this.router.navigate(['/books']);
}

/**
 * Logout user
 * Clears token from localStorage
 */
logout(): void {
  // clear token from localStorage
  this.authService.logout();
  // navigate to login page
  this.router.navigate(['/login']);
}

/**
 * Toggle Theme
 */
toggleTheme(): void {
  this.themeService.toggleTheme();
}

}


