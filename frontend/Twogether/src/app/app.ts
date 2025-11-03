import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './services/api';
import { response } from 'express';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  statusMessage: string = 'Intentando conectar con el backend...';

  constructor(private apiService: Api) {  }

  ngOnInit(): void {
    this.apiService.getStatus().subscribe({
      next: (response) => {
        this.statusMessage = response.message;
      },
      error: (err) => {
        this.statusMessage = 'Error: No se pudo conectar con el backend';
        console.error(err)
      }
    });
  }
  protected readonly title = signal('Twogether');
}
