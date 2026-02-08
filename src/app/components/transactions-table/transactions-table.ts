import { Component, computed, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { Transactions } from '../../interfaces/transactions.interface';
import { CurrencyPipe, I18nPluralPipe } from '@angular/common';
import { RouterLink } from "@angular/router";
import { MovementDetailInfo } from "../movement-detail-info/movement-detail-info";
import { Pagination } from "@shared/pagination/pagination";
import { Utils } from '../../utils/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FormUtils } from '../../utils/form-utils';
import { AlertService } from '@shared/alert-message/alert.service';
import { IconsService } from '@services/icons.service';

export interface TwoColumnInfo {
  title: string;
  items: { title: string, description: string }[];
}

@Component({
  selector: 'transactions-table',
  imports: [CurrencyPipe, RouterLink, MovementDetailInfo, I18nPluralPipe, Pagination],
  templateUrl: './transactions-table.html',
})
export class TransactionsTable {
  private alertService = inject(AlertService);
  iconsService = inject(IconsService);


  movementDetailModal = viewChild<ElementRef<HTMLDialogElement>>('movementDetail')
  transactionsList = input.required<Transactions[]>();
  monthOffset = input.required<number>();
  errorMessage = input<string | unknown | null>();
  isLoading = input<boolean>(false);
  isEmpty = input<boolean>(false);
  deleteMovement = output<string>();


  monthMap = signal({
    '=0': 'actual',
    '=1': 'anterior',
    '=2': 'previo al anterior',
    other: 'desconocido'
  })

  selectedMovement = signal<Transactions | null>(null);
  pageSize = signal(10);
  currentPage = signal(1);

  totalItems = computed(() => {
    const total = this.transactionsList().length;
    return total;
  });

  // Items visibles en la página actual
  paginatedItems = computed(() => {
    const items = this.transactionsList();
    const page = this.currentPage();
    const size = this.pageSize();

    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    return items.slice(startIndex, endIndex);
  });

  resetcurrentPageEffect = effect(() => {
    this.monthOffset();
    this.currentPage.set(1);
  });


  onSelectedMovement(transaction: Transactions) {
    //console.log('transaction selected: ', { transaction });
    this.selectedMovement.set(transaction);
  }

  onDeleteMovement(id: string) {
    this.deleteMovement.emit(id);
    this.movementDetailModal()?.nativeElement.close();
  }

  generateReportPdf() {
    if (this.transactionsList().length === 0) { return };

    // Set document data
    const totals = this.transactionsList().reduce(
      (acc, t) => {
        const amount = Number(t.amount) || 0;
        acc.balance += amount;
        if (t.transactionType === 'income') {
          acc.income += amount;
        } else if (t.transactionType === 'outgoing') {
          acc.expenses += amount;
        }
        return acc;
      },
      {
        balance: 0,
        income: 0,
        expenses: 0,
      }
    );

    const movementsDataIndividual = {
      title: 'Reporte de movimientos',
      items: [
        {
          title: 'Saldo disponible',
          description: `$ ${totals.balance}`
        },
        {
          title: 'Total de ingresos',
          description: `$ ${totals.income}`
        },
        {
          title: 'Total de gastos',
          description: `$ ${totals.expenses}`
        },
      ]
    };

    const movementItems = movementsDataIndividual.items;

    const tableData = {
      headValues: [['Nombre', 'Descripción', 'Monto', 'Información de pago', 'Tipo de transacción', 'Categoría', 'Fecha de operación']],
      tableValues:
        this.transactionsList().map(t => [
          t.title,
          t.description,
          `$${t.amount}`,
          `${t.paymentInfo.bankName} ${t.paymentInfo.title}`,
          FormUtils.transactionTypeTranslations[t.transactionType],
          t.category,
          t.operationDate,
        ])
    }

    Promise.all([
      this.loadImage(Utils.getPngImage('REPORT_BANNER')),
      this.loadImage(Utils.getPngImage('SMARTCONTROL_LOGO')),
      this.loadImage(Utils.getPngImage('MAT_BLACK_LOGO'))
    ])
      .then(([banner, SCLogo, matLogo]) => {
        // 3️⃣ render PDF (TODO aquí)
        this.renderPdf(banner, SCLogo, matLogo, movementsDataIndividual, tableData);
        this.alertService.showAlert('Se ha generado el reporte exitosamente.', 'success');
      });

  }

  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;

      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }

  private renderPdf(banner: HTMLImageElement, SCLogo: HTMLImageElement, matLogo: HTMLImageElement, movementsDataIndividual: any, tableData: any) {
    const doc = new jsPDF();

    const movementItems = movementsDataIndividual.items;
    const date = new Date();
    date.setMonth(date.getMonth() - this.monthOffset());
    const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);

    // Document configs
    const margins = { marginLeft: 15, marginRight: 25, bottom: 36 } as const;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const docConfigs = { margins, pageWidth, pageHeight };

    // HEADER
    const bannerProps = doc.getImageProperties(banner);
    const SCLogoProps = doc.getImageProperties(SCLogo);
    const matLogoProps = doc.getImageProperties(matLogo);
    doc.addImage(banner, 'png', 0, 0, docConfigs.pageWidth, bannerProps.height / docConfigs.pageHeight * 100);
    doc.addImage(SCLogo, 'PNG', 10, 7, SCLogoProps.width * .1, SCLogoProps.height * .1);
    doc.addImage(matLogo, 'png', 150, 7, matLogoProps.width * .09, matLogoProps.height * .09);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('www.mat-angel.com', 150, 29);

    doc.link(150, 7, 502 * .09, (192 * .09) + 5, { url: 'https://mat-angel.com' });

    doc.setFontSize(18);
    doc.text(movementsDataIndividual.title, docConfigs.pageWidth / 2, 45, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 50, 195, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha de solicitud: ${Utils.currentDateTime}`, 195, 55, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Periodo: ${month}`, 15, 70, { align: 'left' });

    doc.setFontSize(12);
    for (let i = 0; i < movementItems.length; i++) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${movementItems[i].title}:`, 15, 80 + i * 10, {
        align: 'left'
      });
      doc.setFont('helvetica', 'normal');
      doc.text(`${movementItems[i].description ?? 'N/A'} `, 70, 80 + i * 10, {
        align: 'left'
      });
    }

    this.generatePdfTable(doc, tableData.headValues, tableData.tableValues, docConfigs);

    //Abre pdf en una nueva pestaña
    window.open(doc.output('bloburl'), '_blank');

    //Guarda archivo pdf
    doc.save(`Reporte_${month}_${date.getFullYear()}.pdf`);

  }

  generatePdfTable(doc: jsPDF, tableHeaders: any, bodyTable: any, docConfigs?: any) {
    autoTable(doc, {
      margin: docConfigs.margins,
      startY: 110,
      head: tableHeaders,
      body: bodyTable,
      didDrawPage: () => {
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        const disclaimerFooterText =
          'Este documento es una representación visual sin valor jurídico, fiscal ni administrativo. Ha sido creado exclusivamente como material de ejemplo/demostración. La información contenida es simulada y no vinculante. Queda prohibido su uso como comprobante de transacción, identidad o propiedad.';
        const copyrightFooterText =
          '© 2026 MAT-ANGEL. Queda prohibida la reproducción total o parcial de este modelo de documento para fines ajenos a esta demostración.';
        const maxWidth = docConfigs.pageWidth * 1.3;
        const disclaimerLines = doc.splitTextToSize(disclaimerFooterText, maxWidth);
        const copyrightLines = doc.splitTextToSize(copyrightFooterText, maxWidth);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(disclaimerLines, docConfigs.margins.marginLeft, docConfigs.pageHeight - 24); // o pageHeight - 12 si son 2+ líneas
        doc.text(copyrightLines, docConfigs.margins.marginLeft, docConfigs.pageHeight - 12); // o pageHeight - 12 si son 2+ líneas

        //Número de página
        doc.text(`Página ${pageNumber}`, docConfigs.pageWidth - docConfigs.margins.marginRight, docConfigs.pageHeight - 5);
      },
    });
  }

}
