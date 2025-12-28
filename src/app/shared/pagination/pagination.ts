import { CommonModule } from '@angular/common';
import { Component, computed, input, linkedSignal, output } from '@angular/core';

@Component({
  selector: 'pagination',
  imports: [CommonModule],
  templateUrl: './pagination.html',
})
export class Pagination {
  pageSize = input.required<number>();
  currentPage = input.required<number>();
  totalItems = input.required<number>();
  pageSelected = output<number>();

    // Total de páginas
  totalPages = computed(() => {
    const total = this.totalItems();
    const size = this.pageSize();
    return size > 0 ? Math.ceil(total / size) : 1;
  });

  getPagesList =  computed(()=> {
    return Array.from({ length: this.totalPages() }, (_, i) => i+1);
  });

  activePage = linkedSignal(this.currentPage);

  fromMovement = computed(()=> {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  })

  toMovement = computed(()=> {
    return Math.min(this.currentPage() * this.pageSize(), this.totalItems());
  })

  selectPage(page: number){
    this.pageSelected.emit(page);
  }

  prevPage() {
    this.pageSelected.emit(this.currentPage() -1);
  }

  nextPage() {
    this.pageSelected.emit(this.currentPage() +1);
  }

}
