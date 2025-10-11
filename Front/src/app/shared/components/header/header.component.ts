import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgClass, NgIf } from "@angular/common";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, NgIf],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  @Input() title: string = 'Título por defecto';
  @Input() subtitle: string = 'Subtítulo por defecto';
  @Input() buttonText: string = '';
  @Input() icon?: string;

  @Output() buttonClick = new EventEmitter<void>(); // 🔥 Output

  onButtonClick() {
    this.buttonClick.emit(); // notifica al componente padre
  }

  get classes() {
    return {
      'bg-white border-b border-gray-200 p-6 sticky top-0 z-10 flex justify-between items-center shadow-sm': true,
    };
  }

  
}
