import { Injectable } from '@angular/core';
import { tokenNotExpired } from 'angular2-jwt';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Person } from '../classes/person';
import { AppSettings } from '../app.settings';

@Injectable()
export class AuthService {
  private loginUrl = AppSettings.API_ENDPOINT + '/login';
  private forgotPasswordUrl = AppSettings.API_ENDPOINT + '/reset_password';

  headers = new Headers({
    'Content-Type': 'application/json'
  });

  constructor(public http: Http) { }

  loggedIn() {
    return tokenNotExpired();
  }

  loggedInUser(): Person {
    const p: Person = JSON.parse(localStorage.getItem('myself'));
    // If no p, then get one via JSON
    return p;
  }

  myId() {return (this.loggedInUser() as any)._id.$oid }

  setLoggedInUser(p: Person) {
    console.log(p);
    localStorage.setItem('myself', JSON.stringify(p));
  }

  stashJWT(response: string) {
    localStorage.setItem('token', response);
  }

  logOut() {
    localStorage.removeItem('token');
  }

  makeLoginAttempt(credentials: any): Promise<any> {
    return this.http.post(
      this.loginUrl,
      JSON.stringify(credentials),
      {headers: this.headers}
    ).toPromise();
  }

  forgotPassword(email: string): Promise<any> {
    return this.http.get(
      this.forgotPasswordUrl,
      { params: {email: email},
        headers: this.headers}
    ).toPromise();
  }
}
