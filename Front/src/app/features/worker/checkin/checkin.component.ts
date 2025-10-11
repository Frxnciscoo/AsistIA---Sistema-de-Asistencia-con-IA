import { Component } from '@angular/core';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from "../../../shared/components/header/header.component";

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [SidebarComponent, HeaderComponent],
  templateUrl: './checkin.component.html',
  styleUrl: './checkin.component.css'
})
export class CheckinComponent {

}
