import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', Validators.required],
      contrasena: ['', Validators.required],
    });
  }

   onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const { correo, contrasena } = this.loginForm.value;
    console.log('[Login] Iniciando login para:', correo);

    this.authService.login(correo, contrasena).subscribe(success => {
      this.isLoading = false;
      console.log('[Login] Success:', success);
      
      if (success) {
        const role = this.authService.getUserRole();
        console.log('[Login] Rol obtenido:', role);
        
        // 🔥 Cambiar las comparaciones para que coincidan con el backend
        if (role === 'Administrador') {  // ✅ Como viene del backend
          console.log('[Login] Redirigiendo a admin dashboard');
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'Trabajador' || role === 'Supervisor') {  // ✅ Otros posibles roles
          console.log('[Login] Redirigiendo a worker history');
          this.router.navigate(['/worker/history']);
        } else {
          console.log('[Login] Rol desconocido:', role, '- redirigiendo a admin');
          this.router.navigate(['/admin/dashboard']); // Por defecto admin
        }
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos';
      }
    });
  }
}