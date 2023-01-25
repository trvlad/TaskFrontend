import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Message } from '../models/message.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private url = '/api/message';
  constructor(public http: HttpClient) {}

  
  public getMessage(idThemes:number,idContacts:number): Observable<Message|null> {
    return this.http.get<Message>(`${this.url}?idThemes=${idThemes}&idContacts=${idContacts}`).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }
  
  public addMessage(message: any): Observable<any> {
    return this.http.post(`${this.url}`, message).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

}
