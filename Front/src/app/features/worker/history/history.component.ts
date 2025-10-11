import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CalendarModule,
  CalendarEvent,
  CalendarMonthViewDay,
  DateAdapter
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { addDays } from 'date-fns';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CalendarConfigModule } from '../../../shared/calendar-config/calendar-config.module';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    ModalComponent,
    CalendarConfigModule, 
  ],
  templateUrl: './history.component.html',
})

export class HistoryComponent {
  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    {
      start: new Date(),
      title: 'Presente',
      color: { primary: '#22c55e', secondary: '#dcfce7' },
    },
    {
      start: addDays(new Date(), 1),
      title: 'Ausente',
      color: { primary: '#ef4444', secondary: '#fee2e2' },
    },
    {
      start: addDays(new Date(), 2),
      title: 'Tarde',
      color: { primary: '#facc15', secondary: '#fef9c3' },
    },
  ];

  // history.component.ts
  isModalOpen = false;           // modal de detalle de asistencia
  isIncidentModalOpen = false;   // modal de reporte de incidencia
  selectedEvent: CalendarEvent | null = null;

  handleDayClick({ day }: { day: CalendarMonthViewDay<CalendarEvent> }) {
    if (day.events.length > 0) {
      this.selectedEvent = day.events[0];
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedEvent = null;
  }

  openIncidentModal() {
    this.isModalOpen = false;
    this.isIncidentModalOpen=true;
  }

  closeIncidentModal() {
    this.isIncidentModalOpen = false;
  }

}
