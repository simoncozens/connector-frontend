import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

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

  constructor(public http: Http, public jwtHelper: JwtHelperService) { }

  loggedIn() {
    return this.jwtHelper.decodeToken()
  }

  loggedInUser(): Person {
    const p: Person = JSON.parse(localStorage.getItem('myself'));
    // If no p, then get one via JSON
    return p;
  }

  myId() {
    var me = this.loggedInUser();
    if ("id" in me && me.id) return me.id;
    return ((me as any)._id.$oid);
  }

  adminUser():boolean {
    const p:Person = this.loggedInUser();
    if (!p) { return false; }
    if (p.roles && p.roles.indexOf("admin") >= 0) { return true; }
    return false;
  }

  setLoggedInUser(p: Person) {
    console.log(p);
    localStorage.setItem('myself', JSON.stringify(p));
  }

  stashJWT(response: string) {
    localStorage.setItem('token', response);
  }

  logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('myself');
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
