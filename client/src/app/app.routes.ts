import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'entries', pathMatch: 'full' },
  {
    path: 'entries',
    loadComponent: () =>
      import('./view/entries/entries.component').then((m) => m.EntriesComponent),
  },
];
