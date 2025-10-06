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

  // Usuario a agregar
  nombre: string = '';
  email: string = '';
  fotoPerfil: string = ''; // Pendiente manejar la foto de perfil
  password: string = ''; // Pendiente: manejar comprobar contraseña
  genero: string = '';
  // fin Usuario a agregar

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

    // Validar datos obligatorios
    if (!this.nombre || !this.email || !this.password) {
      console.log('Por favor, complete todos los campos obligatorios.');
      return;
    }

    // Llamada al servicio para agregar usuario
    this.api.addUser(this.nombre, this.email, this.fotoPerfil, this.password, this.genero).subscribe({
      next: (response) => {
        console.log(response); // success: false, error: 'FDO' | 'FEI' | 'EEU' | 'FCP'
      
        if (!response.success) {
          const code = response.error;
          switch (code) {
            case 'FEI':
              alert('Formato de email inválido.');
              break;
            case 'EEU':
              alert('El email ya está en uso.');
              break;
            case 'FDO':
              alert('Faltan datos obligatorios.');
              break;
            case 'FCP':
              alert('La contraseña es demasiado corta.');
              break;
            default:
              console.log('Error desconocido.', response.error);
          }
        } else {
          console.log('Usuario agregado exitosamente.', response); // success: true, data: ..., message: UCE
        }
      }
    });
  }
  
  protected readonly title = signal('Twogether');
}
