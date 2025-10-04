import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class App {
  msg: string = 'Cargando...';
  users: any[] = [];

  nombre: string = '';
  email: string = '';

  constructor(private api: Api) {  }

  ngOnInit(): void {
    this.api.testConnection().subscribe({
      next: (response) => {
        console.log('API response:', response);
        this.msg = response.message;
      },
      error: (error) => {
        console.error('API error:', error);
      }
    });

     this.api.getAllUsers().subscribe({
      next: (response) => {
        this.users = response;
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      }
    });
  }

  addUser(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.api.addUser(this.nombre, this.email).subscribe({
      next: (response) => {
        console.log('User added:', response);
      },
      error: (error) => {
        console.error('Error adding user:', error);
      }
    });
  }
  
  protected readonly title = signal('Twogether');
}
