import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  constructor(
    private router: Router,
  ) { }

  // Belirtilen yola yönlendirme işlemi
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}