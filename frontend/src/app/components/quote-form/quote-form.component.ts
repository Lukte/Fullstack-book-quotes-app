// Import necessary modules from Angular
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { QuotesService, Quote } from '../../services/quotes.service';
import { AuthService } from '../../services/auth.service';

/**
 * Quote form Component
 * Handles both creating new quotes and editing existing quotes
 * Determines mode based on route parameters
 */
@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [
    CommonModule, // For *ngIf
    FormsModule // for [(*ngFor)]
  ],
  templateUrl: './quote-form.component.html',
  styleUrl: './quote-form.component.css'
})
export class QuoteFormComponent implements OnInit {
  /**
   * Component Properties
   */
  quote: Quote = {
    text: '',
    author: ''
  };

  isEditMode: boolean = false; // to check if one edit or create?
  quoteId: string = '';        // Id of quote being edited
  isLoading: boolean = false;   // Loading state
  errorMessage: string = '';    // error message
  username: string = '';        // Current user's name

  /**
   * Constructor - Dependency Injection
   * @param quotesService -  Service to handle quote API calls
   * @param authService - Service to handle authentication
   * @param router - Service for navigation
   * @param route - Service to access route parameters
   */
  constructor (
    private quotesService: QuotesService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ){}

  /**
   * ngOnInit - Lifecycle Hook
   * 
   * Runs when component loads
   * Checks if we're in edit mode or create mode
   */
  ngOnInit(): void {
    // Get username
    this.username = this.authService.getUsername() || 'user';
    /**
     * Check route paramaters for quote ID
     * If ID exists, we are in the edit mode
     */
    this.route.params.subscribe(params => {
      if(params['id']){
        // Edit mode
        this.isEditMode = true;
        this.quoteId = params['id'];
        this.loadQuote();
      }
      // In no Id, we are in create mode (isEditMode stays false)
    });
  }

  /**
   * Load quote (for edit mode)
   * Fetches the quote data from backend
   */
  loadQuote(): void {
    this.isLoading = true;
    this.errorMessage ='';

    /**
     * Call quotes service to fatch a single quote
     * GET request to: http://localhost:3000/api/quotes/:id
     */
    this.quotesService.getQuote(this.quoteId).subscribe({
      /**
       * Success callback
       */
      next:(quote) => {
        console.log('Quote loaded:', quote);
        // populate form with quote data
        this.quote = quote;
        this.isLoading = false;
      },

      /**
       * Error callback
       */
      error: (error) => {
        console.error('Error loading quote:', error);
        this.isLoading = false;
        if(error.status === 404) {
          this.errorMessage = 'Quote not found.';
        }else if (error.status === 401 || error.status === 403){
          this.errorMessage = 'Session expired. Log in again.';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        }else {
          this.errorMessage = 'Could not load quote. Try again';
        }
      }
    });

  }

  /**
   * Submit Form
   * Handles both creates and update operations
   * Validates input before submmitting
   */
  onSubmit(): void{
    // reset error messages
    this.errorMessage = '';
    /**
     * Validation check: Check if fields are filled
     */
    if(!this.quote.text.trim() || !this.quote.author.trim()){
      this.errorMessage = 'Fill in both the quote and author fields.';
      return;
    }
    // Additional validation for quote text length
    if(this.quote.text.length < 10){
      this.errorMessage = 'Quote text must at least be 10 characters long.';
      return;
    }
    // Show loading state
    this.isLoading = true;
    /**
     * Determines which operation to perform
     */
    if(this.isEditMode){
      this.updateQuote();
    }else{
      this.createQuote();
    }
  }

  /**
   * Add new quote
   * sends POST to backend
   */
  createQuote(): void {
    /**
     * Call service to create new quote
     * POST request to: http://localhost:3000/api/quotes
     * Body {text, author}
     */
    this.quotesService.createQuote(this.quote).subscribe({
      /**
       * Success callback
       */
      next:(response) => {
        console.log('Quote created.', response);
        this.isLoading = false;
        // Navigate to quotes list
        this.router.navigate(['/quotes']);
      },
      /**
       * Error callback
       */
      error:(error) => {
        console.error('Error creating quote:', error);
        this.isLoading = false;

        // Handle specific error cases
        if(error.status === 400){
          // check if it's the 5 quotes limit error
          this.errorMessage = error.error?.message || 'Could not create quote. You have probably reached the 5 quote limt'
        }else if(error.status === 401 || error.status === 403){
          this.errorMessage = 'Session expired. Log in agaiin.';
          setTimeout(() => {
            this.authService.logout();
            // Navogate to login page
            this.router.navigate(['/login']);
          }, 2000);
        }else {
          this.errorMessage = 'Could not crate quote. Try again.';
        }
      }
    });
  }

  /**
   * Update exsiting quote
   * Sends PUT resquset to backend
   */
  updateQuote(): void {
    /**
     * Call quotes servivce to update quote
     * PUR request to: http://localhost:3000/api/quotes/:id
     * Body: {text, author}
     */
    this.quotesService.updateQuote(this.quoteId, this.quote).subscribe({
      /**
       * Success callback
       */
      next:(response) => {
        console.log('Quote updated:', response);
        this.isLoading = false;
        // navigate back to quotes list
        this.router.navigate(['/quotes']);
      },

      /**
       * Error callabck
       */
      error:(error) => {
        error.error('Error updating quote:', error);
        this.isLoading = false;
        if(error.status === 404){
          this.errorMessage = 'Quote not found';
        }else if(error.status === 401 || error.sttaus === 403){
          this.errorMessage = 'Session expired. Please log in again';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }, 2000);
        }else {
          this.errorMessage = 'Could not update quote.Try again';
        }
      }
    });
  }
  /**
   * Cancel form
   * Navigate back to quotes list withoput saving
   */
  cancel(): void {
    this.router.navigate(['quotes']);
  }
  /**
   * Navigate to quotes page
   */
  goToQuotes(): void {
    this.router.navigate(['/quotes']);
  }

  /**
   * Logout user
   */
  logout(): void {
    this.router.navigate(['/login']);
  }

}
