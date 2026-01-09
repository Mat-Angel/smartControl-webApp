import { Component, computed, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
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

  onSelectedMovement(transaction: Transactions) {
    //console.log('transaction selected: ', { transaction });
    this.selectedMovement.set(transaction);
  }

  onDeleteMovement(id: string) {
    this.deleteMovement.emit(id);
    this.movementDetailModal()?.nativeElement.close();
  }


  loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;

      img.onload = () => resolve(img);
      img.onerror = reject;
    });
  }


  generateReportPdf() {
    if (this.transactionsList().length === 0) { return };

    const doc = new jsPDF();

    const marginLeft = 20;
    const marginRight = 20;
    const marginBottom = 18;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const totalBalance = this.transactionsList().reduce((sum, t) => sum + Number(t.amount), 0);
    const totalIncome = this.transactionsList().filter(t => t.transactionType === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = this.transactionsList().filter(t => t.transactionType === 'outgoing')
      .reduce((sum, t) => sum + Number(t.amount), 0);


    const movementsDataIndividual = {
      title: 'Reporte de movimientos',
      items: [
        {
          title: 'Saldo disponible',
          description: `$ ${totalBalance}`
        },
        {
          title: 'Total de ingresos',
          description: `$ ${totalIncome}`
        },
        {
          title: 'Total de gastos',
          description: `$ ${totalExpenses}`
        },
      ]
    };

    const data = movementsDataIndividual.items;

    const headValues = [['Nombre', 'Descripción', 'Monto', 'Información de pago', 'Tipo de transacción', 'Categoría', 'Fecha de operación']];
    const tableValues =
      this.transactionsList().map(t => [
        t.title,
        t.description,
        `$${t.amount}`,
        `${t.paymentInfo.bankName} ${t.paymentInfo.title}`,
        FormUtils.transactionTypeTranslations[t.transactionType],
        t.category,
        t.operationDate,
      ]);



    const date = new Date();
    date.setMonth(date.getMonth() - this.monthOffset());
    const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);

    const imgBanner = new Image();
    imgBanner.src = Utils.getPngImage('REPORT_BANNER');
    doc.addImage(imgBanner, 'png', 0, 0, 210, 35); //TODO Resolver el obtener de forma automatica los tamaños de imagen

    const imgSCLogo = new Image();
    imgSCLogo.src = Utils.getPngImage('SMARTCONTROL_LOGO');
    doc.addImage(imgSCLogo, 'PNG', 10, 7, 563 * .1, 188 * .1); //TODO Resolver el obtener de forma automatica los tamaños de imagen

    const imgMatLogo = new Image();
    imgMatLogo.src = Utils.getPngImage('MAT_BLACK_LOGO');
    doc.addImage(imgMatLogo, 'png', 150, 7, 502 * .09, 192 * .09); //TODO Resolver el obtener de forma automatica los tamaños de imagen

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('www.mat-angel.com', 150, 30);

    doc.link(150, 7, 502 * .09, (192 * .09) + 5, { url: 'https://mat-angel.com' });

    doc.setFontSize(18);
    doc.text(movementsDataIndividual.title, pageWidth / 2, 45, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(15, 50, 195, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Fecha de solicitud: ${Utils.currentDateTime}`, 195, 55, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Periodo: ${month}`, 15, 70, { align: 'left' });


    doc.setFontSize(12);
    for (let i = 0; i < data.length; i++) {
      doc.setFont('helvetica', 'bold');
      doc.text(`${data[i].title}:`, 15, 80 + i * 10, {
        align: 'left'
      });
      doc.setFont('helvetica', 'normal');
      doc.text(`${data[i].description ?? 'N/A'} `, 70, 80 + i * 10, {
        align: 'left'
      });

    }

    autoTable(doc, {
      margin: { left: marginLeft - 5, right: marginRight - 5, bottom: marginBottom + 15 },
      startY: 120,
      head: headValues,
      body: tableValues,
      didDrawPage: () => {
        const pageNumber = doc.getCurrentPageInfo().pageNumber;
        const disclaimerFooterText =
          'Este documento es una representación visual sin valor jurídico, fiscal ni administrativo. Ha sido creado exclusivamente como material de ejemplo/demostración. La información contenida es simulada y no vinculante. Queda prohibido su uso como comprobante de transacción, identidad o propiedad.';
        const copyrightFooterText =
          '© 2026 MAT-ANGEL. Queda prohibida la reproducción total o parcial de este modelo de documento para fines ajenos a esta demostración.';
        const maxWidth = pageWidth * 1.3;
        const disclaimerLines = doc.splitTextToSize(disclaimerFooterText, maxWidth);
        const copyrightLines = doc.splitTextToSize(copyrightFooterText, maxWidth);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(120);
        doc.text(disclaimerLines, marginLeft, pageHeight - 24); // o pageHeight - 12 si son 2+ líneas
        doc.text(copyrightLines, marginLeft, pageHeight - 12); // o pageHeight - 12 si son 2+ líneas

        //Número de página
        doc.text(`Página ${pageNumber}`, pageWidth - 30, pageHeight - 5);
      },
    });

    doc.save(`Reporte_${month}_${date.getFullYear()}.pdf`);
    this.alertService.showAlert('Se ha generado el reporte exitosamente.', 'success');

    const pdfUrl = doc.output('bloburl');
    window.open(pdfUrl, '_blank');
  }

  /*
    generatePdf(data: Transactions[]) {
      // 1️⃣ preparar datos síncronos
      const tableRows = data.map(item => [
        item.date,
        item.description,
        `$${item.amount.toFixed(2)}`
      ]);

      const footerText =
        '© 2026 MAT-ANGEL. Uso exclusivo demostrativo.';

      // 2️⃣ cargar imágenes (asíncrono)
      Promise.all([
        this.loadImage('assets/PNG/logocolorsmall.png'),
        this.loadImage('assets/PNG/header.png'),
      ])
        .then(([logo, header]) => {
          // 3️⃣ render PDF (TODO aquí)
          this.renderPdf({
            logo,
            header,
            tableRows,
            footerText
          });
        });
    }

    private renderPdf(params: {
      logo: HTMLImageElement;
      header: HTMLImageElement;
      tableRows: any[][];
      footerText: string;
    }) {
      const doc = new jsPDF('p', 'mm', 'a4');

      // HEADER
      doc.addImage(params.header, 'PNG', 0, 0, 210, 30);
      doc.addImage(params.logo, 'PNG', 20, 10, 40, 12);

      doc.setFontSize(12);
      doc.text('Estado de Cuenta', 20, 45);

      // TABLA
      autoTable(doc, {
        startY: 50,
        head: [['Fecha', 'Concepto', 'Monto']],
        body: params.tableRows,
        margin: { bottom: 20 },

        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();

          const maxWidth = pageWidth - 40;
          const lines = doc.splitTextToSize(params.footerText, maxWidth);

          doc.setFontSize(8);
          doc.setTextColor(120);

          doc.text(lines, 20, pageHeight - 10);
          doc.text(
            `Página ${doc.getCurrentPageInfo().pageNumber}`,
            pageWidth - 30,
            pageHeight - 10
          );
        }
      });

      doc.save('estado-cuenta.pdf');
    }


    */



}
