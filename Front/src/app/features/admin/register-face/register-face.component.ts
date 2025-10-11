import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-register-face',
  standalone: true,
  imports: [CommonModule, SidebarComponent, FormsModule, HeaderComponent],
  templateUrl: './register-face.component.html',
})
export class RegisterFaceComponent {
  selectedEmployee: string = '';
  isNewEmployee: boolean = false;
  newEmployeeName: string = '';
  faceImages: File[] = [];
  facePreviews: string[] = [];

  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      this.faceImages[index] = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.facePreviews[index] = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  registerFace() {
    if (this.isNewEmployee && !this.newEmployeeName.trim()) {
      alert('Debes ingresar el nombre del nuevo empleado');
      return;
    }

    if (!this.isNewEmployee && !this.selectedEmployee) {
      alert('Debes seleccionar un empleado existente');
      return;
    }

    if (this.faceImages.length < 4 || this.faceImages.some(img => !img)) {
      alert('Debes subir las 4 imágenes del rostro');
      return;
    }

    console.log('Empleado:', this.isNewEmployee ? this.newEmployeeName : this.selectedEmployee);
    console.log('Imágenes:', this.faceImages);

    alert('Rostro registrado con éxito');

    this.faceImages = [];
    this.facePreviews = [];
    this.newEmployeeName = '';
    this.selectedEmployee = '';
    this.isNewEmployee = false;
  }
}
