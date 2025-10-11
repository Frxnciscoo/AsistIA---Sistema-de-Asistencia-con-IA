import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  login(username: string, password: string): boolean {
    if (
      (username === 'worker' && password === 'workerpass') ||
      (username === 'admin' && password === 'adminpass')
    ) {
      const role = username === 'worker' ? 'WORKER' : 'ADMIN';
      localStorage.setItem('user', JSON.stringify({ username, role }));
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('user');
  }

  getUserRole(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  }

  getUsername(): string | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).username : null;
  }
}
