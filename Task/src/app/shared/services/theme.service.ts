import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Theme } from '../models/theme.model';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private url = '/api/theme';
  constructor(public http: HttpClient) {}


  public getTheme(id:number): Observable<Theme|null> {
    return this.http.get<Theme>(`${this.url}/${id}`).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  public getAllThemes(): Observable<Theme[]|null> {
    return this.http.get<Theme[]>(`${this.url}`).pipe(
      map((res) => res.sort((prev, next) => prev.id - next.id)),
      catchError(() => {
        return of(null);
      } )
    );
  }

  public addTheme(themeText: string): Observable<any> {
    let theme = {
      theme: themeText
    }
    return this.http.post(`${this.url}`, theme).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

}
