import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Register component
 * 
 * Handles user registration (creating new account)
 */

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, // Provides *ngIf, *ngFor
    FormsModule   // Enables [(ngModel)] two way bindings
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  /**
   * Component Propereties (Form data)
   * This store the user's input from the registration form
   */

  username: string = ''; // username input
  email: string = '';    // email input
  password: string= ''; // Password input
  confirmPassword: string = ''; // Cofirm password input

  // UI state variables
  errorMessage: string= ''; // Error message to display
  successMessage: string = ''; // success message to display
  isLoading: boolean = false; // Loading state during registration

  /**
   * Constructor - Dependency Injection
   * @param authService - Service to handle authentication
   * @param router - Service to navigate between pages
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ){}

  /**
   * Register method
   * 
   * Called when user clicks "Register button"
   * Validates input and sends registration to backend 
   */
  onRegister(): void {
    // Reset messages from previous attempts
    this.errorMessage = '';
    this.successMessage = '';

    /**
     * Validation 1: check if all fields are filled
     * 
     * trim() removed white spaces from start/end
     * If ant field is empty, show error and stop
     */
    if(!this.username.trim() || !this.email.trim() || 
    !this.password.trim() || !this.confirmPassword.trim()){
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    /**
     * Validation 2: check if passewords match
     * User must type password twice to confirm they don't make a typo 
     */
    if(this.password != this.confirmPassword){
      this.errorMessage = 'Passwords do not match';
      return;
    }

    /**
     * Validation 3: Check password length
     */

    if(this.password.length < 6){
      this.errorMessage = 'Password must be at leat 6 chracters';
      return;
    }
    /**
     * Validation 4: Basic email format check
     * Regular expression to check if email looks valid
     * Example: user@example.com
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailRegex.test(this.email)){
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Show Loading state
    this.isLoading = true;

    /**
     * Call AuthService to register user
     * 
     * Sends username, email, password to backend
     * Backend will:
     * - Hash the password
     * - Save user to MangoDB
     *  - Return success or error
     */
    this.authService.register(this.username, this.email, this.password).subscribe({

      /**
       * Success callback
       * 
       * Run when registration is successful
       */
      next: (response) =>{
        console.log('Registration successul:', response);
        // hide loading spinner
        this.isLoading = false;
        // show success message
        this.successMessage = 'Registration successful! Redirecting to login...';
        
        /**
         * Redirect to login page after 2 seconds
         * 
         * setTimeout delays execusion
         * Gives user time to see success message
         */
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      /**
       * Error callback
       * 
       * Runs when registration fails
       * COuld be: username taken, email exists, server error, etc.
       */
      error:(error) => {
        console.log('Registration error:', error);

        // Hide loading spinner
        this.isLoading = false;

        /**
         * Display error message to user
         * 
         * Try to get specific message from backend
         * If not available, show generic message
         * 
         * error.error?. message uses optional chaining (?.)
         * - Safely accesses nested properties
         * - Returns if property doesn't exist
         */
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';

      }

    });
 
  }

  /**
   * Navidate to login page
   * 
   * Called when a use clicks "login here " link
   * Takes user back to login page
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
