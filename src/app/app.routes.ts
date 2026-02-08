import { Routes } from '@angular/router';
import { IsAuthenticatedGuard } from './auth/guards/is-authenticated.guard';

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import('./pages/home-page/home-page'),
  },
  /*
  TODO: Generar página de inicio para mostrar ejemplos
  {
    path: 'dashboard',
    title: 'Inicio',
    loadComponent: () => import('./layouts/smart-control-layout/smart-control-layout'),
    data: { mode: 'require-auth', onMenu: true },
    canMatch: [IsAuthenticatedGuard]
  },
  */
  {
    path: 'movements',
    title: 'Movimientos',
    loadComponent: () => import('./layouts/smart-control-layout/smart-control-layout'),
    data: { mode: 'require-auth', onMenu: true },
    canMatch: [IsAuthenticatedGuard]
  },
  {
    path: 'register_transaction',
    title: 'Registrar movimiento',
    loadComponent: () => import('./pages/register-transaction-page/register-transaction-page'),
    data: { mode: 'require-auth', onMenu: false },
    canMatch: [IsAuthenticatedGuard]
  },
  {
    path: 'register_transaction/:id',
    title: 'Editar movimiento',
    loadComponent: () => import('./pages/register-transaction-page/register-transaction-page'),
    data: { mode: 'require-auth', onMenu: false },
    canMatch: [IsAuthenticatedGuard]
  },

  {
    path: 'automated_payments',
    title: 'Cargos Automáticos',
    loadComponent: () => import('./pages/automated-payments-page/automated-payments-page'),
    data: { mode: 'require-auth', onMenu: true },
    canMatch: [IsAuthenticatedGuard]
  },

  {
    path: 'my_cards',
    title: 'Mis tarjetas',
    loadComponent: () => import('./pages/my-cards-page/my-cards-page'),
    data: { mode: 'require-auth', onMenu: true },
    canMatch: [IsAuthenticatedGuard],
  },
  {
    path: 'register_card',
    title: 'Registrar tarjeta',
    loadComponent: () => import('./pages/register-card-page/register-card-page'),
    data: { mode: 'require-auth', onMenu: false },
    canMatch: [IsAuthenticatedGuard],


  },
  {
    path: 'register_card/:id',
    title: 'Registrar tarjeta',
    data: { mode: 'require-auth', onMenu: false },
    loadComponent: () => import('./pages/register-card-page/register-card-page'),
    canMatch: [IsAuthenticatedGuard],
  },
  {
    path: 'statistics',
    title: 'Estadísticas',
    loadComponent: () => import('./pages/statistics-page/statistics-page'),
    data: { mode: 'require-auth', onMenu: true },
    canMatch: [IsAuthenticatedGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    data: { mode: 'guest-only', onMenu: false },
    canMatch: [IsAuthenticatedGuard]
  },

  {
    path: '',
    redirectTo: "",
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: "",
    pathMatch: 'full'
  }

];
