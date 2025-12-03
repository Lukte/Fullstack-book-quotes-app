import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Store current theme
  private isDarkModeSubject = new BehaviorSubject<boolean>(this.getInitialTheme());
  
  // Observable for components to subscribe to
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    // Apply theme on service initialization
    this.applyTheme(this.isDarkModeSubject.value);
  }

  /**
   * Get initial theme from localStorage or default to light
   */
  private getInitialTheme(): boolean {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme === 'dark';
    }
    return false; // Default to light theme
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.isDarkModeSubject.next(newTheme);
    this.applyTheme(newTheme);
    this.saveTheme(newTheme);
  }

  /**
   * Apply theme by adding/removing CSS class to body
   */
  private applyTheme(isDark: boolean): void {
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    }
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(isDark: boolean): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }

  /**
   * Check if dark mode is currently active
   */
  isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}