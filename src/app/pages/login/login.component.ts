import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { NavController, NavParams } from 'ionic-angular';
import { HomePage } from '../../pages/home/home';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  loginFail: boolean;
  constructor(private auth: AuthService, fb: FormBuilder, public navCtrl: NavController, public navParams: NavParams) {
    this.loginForm = fb.group({
      'email': '',
      'password': ''
    });
    if (this.auth.loggedIn()) { this.gotoNext(); }
  }
  submitForm(credentials: any) {
    console.log("Login attempt", credentials)
    this.loginFail = false;
    return this.auth.makeLoginAttempt(credentials)
      .then(s => this.handleLoginSuccess(s))
      .catch(e => this.handleLoginError(e));
  }

  private handleLoginSuccess(response: Response) {
    const parsed = response.json();
    this.auth.stashJWT(parsed['token']);
    this.auth.setLoggedInUser(parsed);
    this.gotoNext();
  }

  private gotoNext() {
    this.navCtrl.setRoot( this.navParams.get("next") || HomePage)

  }

  private handleLoginError(error: any) {
    this.loginFail = true;
  }

}
