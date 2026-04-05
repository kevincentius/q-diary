import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule, RouterOutlet],
  selector: 'app-root',
  standalone: true,
  template: ` <router-outlet></router-outlet> `,
})
export class App {}
