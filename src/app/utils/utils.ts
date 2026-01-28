import { formatDate } from '@angular/common';
import { inject } from '@angular/core';




export class Utils {
  static currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en-US');
  static currentDateTime = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');
  static readonly MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;


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
    'HOME': 'home.svg'
  } as const;


  static getPngImage(name: keyof typeof Utils.pngImage): string {
    return `${Utils.paths.PNG}${Utils.pngImage[name]}`;
  }

  static getSvgImage(name: keyof typeof Utils.svgImage): string {
    return `${Utils.paths.SVG}${Utils.svgImage[name]}`;
  }


  static scrollToTop() {
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 5);
  }

  static scrollToBottom() {
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 5);
  }
}

