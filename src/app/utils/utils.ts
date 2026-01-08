import { formatDate } from '@angular/common';

export class Utils {
  static currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  static currentDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');


}

