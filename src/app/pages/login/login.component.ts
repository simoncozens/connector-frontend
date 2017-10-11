import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Router, ActivatedRoute } from '@angular/router';
import { InterComponentMessageService } from '../../services/intercomponentmessage.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginFail: boolean;
  constructor(private auth: AuthService,
    public interComponentMessageService: InterComponentMessageService,
    private router: Router, private route: ActivatedRoute, fb: FormBuilder) {
    this.loginForm = fb.group({
      'email': '',
      'password': ''
    });
    if (this.auth.loggedIn()) {
      this.gotoNext();
    }
  }
  submitForm(credentials: any) {
    this.loginFail = false;
    return this.auth.makeLoginAttempt(credentials)
      .then(s => this.handleLoginSuccess(s))
      .catch(e => this.handleLoginError(e));
  }

  private handleLoginSuccess(response: Response) {
    const parsed = response.json();
    this.auth.stashJWT(parsed['token']);
    this.auth.setLoggedInUser(parsed);
    this.interComponentMessageService.sendMessage('navbar','check read');
    this.gotoNext();
  }

  private gotoNext() {
    console.log(this.route.snapshot.queryParams['continue']);
    const next = this.route.snapshot.queryParams['continue'] || '';
    this.router.navigate([next]);
  }

  private handleLoginError(error: any) {
    this.loginFail = true;
  }

  changeLocale(locale: string) {
    localStorage.setItem('localeId', locale);
  }

}
