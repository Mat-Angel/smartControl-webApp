import { formatDate } from '@angular/common';

export class Utils {
  static currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  static currentDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');

  static paths = {
    'PNG': '/assets/PNG/',
    'SVG': '/assets/SVG/',
    'ICON': '/assets/ICONS/'
  };

  static pngImage = {
    'REPORTBANNER': 'report_banner.png',
    'MATBLACKLOGO': 'mat_minimal_black_logo.png',
    'SMARTCONTROLLOGO': 'smartControl_logo.png'
  };

  static svgImage = {
    'MATWHITEICON': 'mat_white_icon.svg'
  };

  static svgLogo = {
  };

}

