import { formatDate } from '@angular/common';

export class Utils {
  static currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  static currentDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');

  static paths = {
    'PNG': '/assets/PNG/',
    'SVG': '/assets/SVG/',
    'ICON': '/assets/ICONS/'
  } as const;

  static pngImage = {
    'REPORT_BANNER': 'report_banner.png',
    'MAT_BLACK_LOGO': 'mat_minimal_black_logo.png',
    'SMARTCONTROL_LOGO': 'smartControl_logo.png'
  } as const;

  static svgImage = {
    'MAT_WHITE_ICON': 'mat_white_icon.svg'
  } as const;

  static svgIcon = {
  } as const;


  static getPngImage(name: keyof typeof Utils.pngImage): string {
    return `${Utils.paths.PNG}${Utils.pngImage[name]}`;
  }

  static getSvgImage(name: keyof typeof Utils.svgImage): string {
    return `${Utils.paths.SVG}${Utils.svgImage[name]}`;
  }

  static getSvgIcon(name: keyof typeof Utils.svgIcon): string {
    return `${Utils.paths.ICON}${Utils.svgIcon[name]}`;
  }
}

