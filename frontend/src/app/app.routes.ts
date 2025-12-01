import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { BooksComponent } from './components/books/books.component';
import { BookFormComponent } from './components/book-form/book-form.component';
import { QuotesComponent } from './components/quotes/quotes.component';
import { QuoteFormComponent } from './components/quote-form/quote-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },  // Default route
  { path: 'login', component: LoginComponent },           // Login route
  { path: 'register', component: RegisterComponent},  // Resgiter route
  { path: 'books', component: BooksComponent },       // Books list
  { path: 'books/new', component: BookFormComponent }, // Create new book
  { path: 'books/edit/:id', component: BookFormComponent }, // Edit book
  { path: 'quotes', component: QuotesComponent},          // Quotes list
  { path: 'quotes/new', component: QuoteFormComponent},   // Create new quote    
  { path: 'quotes/edit/:id', component: QuoteFormComponent} // edit quote

];