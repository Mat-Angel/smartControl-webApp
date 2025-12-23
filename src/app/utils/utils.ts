import { formatDate } from '@angular/common';

export class Utils {
  static currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');


}

