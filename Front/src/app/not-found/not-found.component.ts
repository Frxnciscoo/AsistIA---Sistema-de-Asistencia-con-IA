import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent {
  errorCode: number = 404;
  message: string = '';
  imageUrl: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const state = history.state;
    if (state && state.errorCode) this.errorCode = state.errorCode;

    if (this.errorCode === 403) {
      this.message = 'No tienes permisos para acceder a esta página.';
      this.imageUrl = 'assets/img/403Forbidden.svg';
    } else {
      this.message = 'La página que buscas no existe.';
      this.imageUrl = 'assets/img/404NotFound.svg';
    }
  }

  goHome() {
    this.router.navigate(['/auth/login']);
  }
}
