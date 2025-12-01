import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';


/**
 * Login component
 * - A component is a building block of angular apps
 * it combines: HTML (tmeplates) + typeScrips (logic) + CSS (styles
 * this component handles user login
 * */

//@component: decorator- tells Angular this is a component

@Component({
  // selector: how you use this component in HTML
  selector: 'app-login',

  standalone: true,

  // Imports: other modules this component needs
  imports: [
    CommonModule, // provides common directives like *ngIf, *ngfor
    FormsModule   // Enables two-way binding with [(ngModule)]
  ],

  // template: the HTML file for this component
  templateUrl: './login.component.html',

  // CSS: the CSS file for this component
  styleUrl: './login.component.css'
})
export class LoginComponent {
  /**
   * Component Properties (Data)
   * This are the variables that store the component's state
   * they can be used in the HTML template
   */

  // Form data - bound to imput fields in HTML
  username: string = ''; // stores username input
  password: string = ''; // stors password input

  // UI state variables
  errorMessage: string = ''; // stores error messages
  isLoading: boolean = false; // shows loading spinner during login


  /**
   * Constructor: - runs when component is created
   * 
   * Dependency Injection:
   * - Angular automatically provides (injects) these services
   * - We just need what we need, Angular hadles the rest
   * @param authService - Service to handle authentication
   * @param router - Services to navigate between pages
   */
  constructor(
    private authService: AuthService, // Injected: Auth service
    private router: Router             // Injected: router for navigation
  ){}

  /**
   * Login Method
   * 
   * Called when user clicks "Login" button
   * sends credentials to backend via AuthService 
   */

  onLogin(): void {
    // reset error message from previous attempts
    this.errorMessage = '';

    /**
     * Validation: check if fields are filled
     * 
     * trim() removes whitespace from start/end
     * !username means "if username is empty or only spaces"
     */

    if(!this.username.trim() || !this.password.trim()){
      // set error message (Will be displayed in HTML)
      this.errorMessage = 'Please enter bothh username and password';
      return; // Exit functionm ealry - don't proceed with login
    }

    /**
     * Show login state 
     * 
     * This will:
     * - Disable the login button (to prevent double- clicks)
     * - Show a loading spinner (optional, in HTML)
     */
    this.isLoading = true;

    /**
     * Call AuthService to login
     * authService.login() returns an observable
     * .subscribe() is how we "listen" to the response
     */

    this.authService.login(this.username, this.password).subscribe({

      /**
       * next: success callback
       * 
       * runs when login is successful
       * response contains: {token, username, message}
       */
      next: (response) => {
        console.log('Login successful', response);
        this.isLoading = false;

        /**
         * Navigate to books page
         * 
         * router.navigate() changes the URL and loads new component
         * Like clicing a link
         */
        this.router.navigate(['/books']);
      },

      /**
       * error: Error callback
       * 
       * Runs when login fails (wrong credentialss, server error, etc)
       */
      error: (error) => {
        console.error('Login error:', error);

        // hide loading spinner
        this.isLoading = false;

        /**
         * Display error message to user
         * error.error?.message tries to get message from backend 
         * if not available, shows generice message
         * The ?. is "optional chaining" - safely accesses nested properties
         */
        this.errorMessage = error.error?.message || 'login failed. Please try again.';
      }
    });
  }

  /**
   * Navigate to register page
   * 
   * Called when user clicks "Register" link
   * Redirects to registration page
   */

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
