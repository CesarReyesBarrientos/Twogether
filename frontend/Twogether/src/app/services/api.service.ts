import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  testConnection(): Observable<any> {
    return this.http.get(`${this.baseUrl}/test`);
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getAllUsers`);
  }

  addUser(nombre: string, email: string): Observable<any> {
    const body = { nombre, email };
    return this.http.post(`${this.baseUrl}/addUser`, body);
  }
}
