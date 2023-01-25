import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Contact } from '../models/contact.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private url = '/api/contact';
  constructor(public http: HttpClient) {}


  public getContact(email:string,phoneNumber:string): Observable<Contact|null> {
    return this.http.get<Contact>(`${this.url}?email=${email}&phoneNumber=${phoneNumber}`).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  public addContact(contact: any): Observable<any> {
    return this.http.post(`${this.url}`, contact).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

}
