import { Routes } from '@angular/router';
import { IsAuthenticatedGuard } from './auth/guards/is-authenticated.guard';

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import('./pages/home-page/home-page'),
  },
  {
    path: 'dashboard',
    title: 'Inicio',
    loadComponent: () => import('./layouts/smart-control-layout/smart-control-layout'),
    data: { mode: 'require-auth' },
    canMatch: [IsAuthenticatedGuard]
  },
  {
    path: 'movements',
    title: 'Movimientos',
    loadComponent: () => import('./layouts/smart-control-layout/smart-control-layout'),
    data: { mode: 'require-auth' },
    canMatch: [IsAuthenticatedGuard]
  },
  {
    path: 'register_transaction',
    title: 'Registrar movimiento',
    loadComponent: () => import('./pages/register-transaction-page/register-transaction-page'),
    data: { mode: 'require-auth' },
    canMatch: [IsAuthenticatedGuard],
        children: [
      {
        path: 'edit/:id',
        title: 'Detalle de movimiento',
        loadComponent: () => import('./pages/register-transaction-page/register-transaction-page'),
      }
    ]
  },
  {
    path: 'my_cards',
    title: 'Mis tarjetas',
    loadComponent: () => import('./pages/my-cards-page/my-cards-page'),
    data: { mode: 'require-auth' },
    canMatch: [IsAuthenticatedGuard],
    children: [
      {
        path: 'register_card',
        title: 'Registrar tarjeta',
        loadComponent: () => import('./pages/register-card-page/register-card-page'),
      }
    ]
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
    data: { mode: 'guest-only' },
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
