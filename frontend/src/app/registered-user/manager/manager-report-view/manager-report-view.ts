import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ROBOTO_BOLD_BASE64, ROBOTO_REGULAR_BASE64 } from './fonts';
import User from '../../../models/user';
import { AuthService } from '../../../services/auth-service/auth-service';
import Reservation from '../../../models/reservation';
import { ReservationService } from '../../../services/reservation-service/reservation-service';
import { WorkspaceService } from '../../../services/workspace-service/workspace-service';
import Workspace from '../../../models/workspace';

@Component({
  selector: 'app-manager-report-view',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-report-view.html',
  styleUrl: './manager-report-view.css',
})
export class ManagerReportView implements OnInit{
  monthOptions = [
    { value: 1, label: 'Januar' },
    { value: 2, label: 'Februar' },
    { value: 3, label: 'Mart' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Maj' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Avgust' },
    { value: 9, label: 'Septembar' },
    { value: 10, label: 'Oktobar' },
    { value: 11, label: 'Novembar' },
    { value: 12, label: 'Decembar' },
  ];

  private authService = inject(AuthService);
  private reservationService = inject(ReservationService);
  private workspaceService = inject(WorkspaceService);

  selectedMonth: number | null = null;
  selectedYear: number | null = null;

  loading = false;
  successMessage = '';
  errorMessage = '';

  reportGenerated = false;
  reportSummary = '';

  user: User | null = null;
  reservations: Reservation[] = [];
  workspaces: Workspace[] = [];
  private robotoFontsReady = false;

  async ngOnInit()
  {
    this.user = await this.authService.getUser();
    this.reservations = await this.reservationService.getFirmReservations(this.user!.firmId);
    this.reservations = this.reservations.filter(res => res.status == 'confirmed');
    this.workspaces = await this.workspaceService.getWorkspacesByFirmId(this.user!.firmId);
  }

  canGenerateReport()
  {
    return (
      this.selectedMonth !== null &&
      this.selectedYear !== null &&
      Number.isInteger(this.selectedYear) &&
      this.selectedYear > 0 &&
      !this.loading
    );
  }

  generateReport()
  {
    this.successMessage = '';
    this.errorMessage = '';
    this.reportGenerated = false;
    this.reportSummary = '';

    if (this.selectedMonth === null || this.selectedYear === null) 
    {
      this.errorMessage = 'Izaberite mesec i godinu za izveštaj.';
      return;
    }

    if (!Number.isInteger(this.selectedYear) || this.selectedYear <= 0) 
    {
      this.errorMessage = 'Godina mora biti ceo pozitivan broj.';
      return;
    }

    const now = new Date();

    if (now.getFullYear() < this.selectedYear || (now.getFullYear() == this.selectedYear && now.getMonth() + 1 < this.selectedMonth))
    {
      this.errorMessage = 'Možete izabrati samo mesec iz prošlosti ili tekući mesec';
      return;
    }

    this.loading = true;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const fontsLoaded = this.ensureRobotoFonts(doc);
      if (!fontsLoaded) 
      {
        this.errorMessage = 'Font nije učitan.';
        return;
      }

      const monthLabel = this.getSelectedMonthLabel();
      const usageRows = this.buildWorkspaceUsageRows(this.selectedYear, this.selectedMonth);
      const monthDays = this.getDaysInMonth(new Date(this.selectedYear, this.selectedMonth - 1, 1));
      const totalReservations = usageRows.reduce((sum, row) => sum + row.reservationCount, 0);
      const totalReservedResourceDays = usageRows.reduce((sum, row) => sum + row.reservedResourceDays, 0);
      const totalAvg = (totalReservedResourceDays / monthDays) * 100;
      
      const generatedAt = new Date();
      const generatedAtText = generatedAt.toLocaleString('sr-RS');

      doc.setFont('Roboto', 'bold');
      doc.setFontSize(18);
      doc.text('Izveštaj o popunjenosti radnih prostora', 14, 20);

      doc.setFont('Roboto', 'normal');
      doc.setFontSize(12);
      doc.text(`Period: ${monthLabel} ${this.selectedYear}.`, 14, 30);
      doc.text(`Datum generisanja: ${generatedAtText}`, 14, 37);

      const generatedBy = this.getGeneratedByLabel();
      const generatedByLines = doc.splitTextToSize(`Generisao korisnik: ${generatedBy}`, 180);
      doc.text(generatedByLines, 14, 44);
      const tableStartY = 44 + generatedByLines.length * 6 + 4;

      const tableBody: (string | number)[][] = usageRows.map(row => [
        row.workspaceName,
        row.reservationCount,
        `${row.percentage.toFixed(2)}%`,
      ]);

      tableBody.push([
        'UKUPNO',
        totalReservations,
        `${totalAvg.toFixed(2)}%`,
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [['Radni prostor', 'Broj rezervacija', 'Prosečna popunjenost']],
        body: tableBody,
        theme: 'grid',
        styles: {
          font: 'Roboto',
          fontSize: 11,
        },
        headStyles: {
          font: 'Roboto',
          fontStyle: 'bold',
        }
      });

      const safeMonth = monthLabel.toLowerCase();
      const fileName = `izvestaj-${safeMonth}-${this.selectedYear}.pdf`;
      doc.save(fileName);

      this.reportGenerated = true;
      this.successMessage = 'Izveštaj je uspešno generisan.';
      this.reportSummary = `Preuzet je PDF izveštaj za ${monthLabel} ${this.selectedYear}.`;
    } catch {
      this.errorMessage = 'Došlo je do greške prilikom generisanja izveštaja.';
    } finally {
      this.loading = false;
    }
  }

  private buildWorkspaceUsageRows(year: number, month: number)
  {
    const monthDays = this.getDaysInMonth(new Date(year, month - 1, 1));
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    
    const usageByWorkspace = new Map<string, {
      openReservationsByDay: Map<string, number>;
      privateReservedByDayAndSpace: Set<string>;
      openCapacity: number;
      reservationCount: number;
    }>();

    for (const ws of this.workspaces)
    {
      const approvalDate = new Date(ws.approvalDate);

      if (approvalDate > monthEnd)
        continue;

      usageByWorkspace.set(ws.name, {
        openReservationsByDay: new Map<string, number>(),
        privateReservedByDayAndSpace: new Set<string>(),
        openCapacity: ws.capacity,
        reservationCount: 0,
      });
    }

    for (const reservation of this.reservations) 
    {
      const workspaceData = usageByWorkspace.get(reservation.workspaceName);
      if (!workspaceData)
        continue;

      const start = new Date(reservation.startDate);
      const end = new Date(reservation.endDate);

      if (start.getFullYear() !== year || start.getMonth() + 1 !== month)
        continue;

      if (end <= start)
        continue;

      const dayKey = `${String(start.getDate())}`;

      if (reservation.type === 'private') 
      {
        const privateKey = `${reservation.privateSpaceName}||${dayKey}`;
        workspaceData.privateReservedByDayAndSpace.add(privateKey);
      } 
      else 
      {
        const currentOpen = workspaceData.openReservationsByDay.get(dayKey) || 0;
        workspaceData.openReservationsByDay.set(dayKey, 1);
      }

      workspaceData.reservationCount += 1;
    }

    return Array.from(usageByWorkspace.entries())
      .map(([workspaceName, values]) => {
        let openReservedResourceDays = 0;

        for (const openCount of values.openReservationsByDay.values())
          openReservedResourceDays += Math.min(openCount, values.openCapacity);

        const privateReservedResourceDays = values.privateReservedByDayAndSpace.size;
        const reservedResourceDays = openReservedResourceDays + privateReservedResourceDays;
        const percentage = (reservedResourceDays / monthDays) * 100;

        return {
          workspaceName,
          reservationCount: values.reservationCount,
          reservedResourceDays,
          percentage,
        };
      })
      .sort((a, b) => a.workspaceName.localeCompare(b.workspaceName));
  }

  getSelectedMonthLabel()
  {
    return this.monthOptions.find(m => m.value === this.selectedMonth)?.label || '';
  }

  getGeneratedByLabel()
  {
    if (!this.user)
      return 'Nepoznat korisnik';
    return `${this.user.firstName} ${this.user.lastName} (${this.user.username})`;
  }

  ensureRobotoFonts(doc: jsPDF)
  {
    if (this.robotoFontsReady)
      return true;

    try {
      doc.addFileToVFS('Roboto-Regular.ttf', ROBOTO_REGULAR_BASE64);
      doc.addFileToVFS('Roboto-Bold.ttf', ROBOTO_BOLD_BASE64);
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

      this.robotoFontsReady = true;
      return true;
    } catch {
      return false;
    }
  }


  getDaysInMonth(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth(); 

    return new Date(year, month + 1, 0).getDate();
  }
}
