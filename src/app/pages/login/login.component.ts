import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';
import { PeopleComponent } from '../../pages/people/people';
import { OfflinePersonService } from '../../services/offline.person.service';
import { NotificationService } from '../../services/notification.service';
import { ToastController, Events } from 'ionic-angular';

@Component({
  selector: 'login',
  templateUrl: './login.component.html'
})
export class LoginComponent {
  @ViewChild('email') mailField ;

  loginForm: FormGroup;
  loginFail: boolean;
  constructor(private auth: AuthService,
    public ops: OfflinePersonService,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public events: Events,
    fb: FormBuilder,
    private toastCtrl: ToastController,
    public platform: Platform,
    public navCtrl: NavController,
    public notificationService: NotificationService,
    public navParams: NavParams) {
    this.loginForm = fb.group({
      'email': '',
      'password': ''
    });
    if (this.auth.loggedIn()) { this.gotoNext(); }
  }
  submitForm(credentials: any) {
    const loading = this.loadingCtrl.create({
      content: 'Logging in...'
    });
    console.log("Login attempt", credentials)
    this.loginFail = false;
    return this.auth.makeLoginAttempt(credentials)
      .then(s => {
        loading.dismiss();
        this.handleLoginSuccess(s)
      })
      .catch(e => {
        loading.dismiss();
        this.handleLoginError(e);
      });
  }

  private handleLoginSuccess(response: Response) {
    const parsed = response.json();
    this.auth.stashJWT(parsed['token']);
    this.auth.setLoggedInUser(parsed);
    this.events.publish('loggedIn');
    if (this.platform.is('cordova')) {
      this.notificationService.init()
      this.sync()
    } else {
      this.gotoNext()
    }
  }

  private gotoNext() {
    this.navCtrl.setRoot( this.navParams.get("next") || PeopleComponent)

  }

  private handleLoginError(error: any) {
    this.loginFail = true;
  }

  forgotPassword(credentials) {
    // First check user is set
    if (!credentials.email) {
      this.mailField.setFocus();
      return false;
    }
    this.auth.forgotPassword(credentials.email).then()
      .then(response => {
          let toast = this.toastCtrl.create({
            message: 'Instructions have been sent to your email',
            duration: 3000,
            position: 'bottom'
          });
          toast.present()
      })
      .catch((err) => this.dammit(err));
  }

  sync() {
    const loading = this.loadingCtrl.create({
      content: 'Syncing...'
    });
    loading.present();
    this.ops.sync().then( () => {
      loading.dismiss();
      this.gotoNext();
    }, (err) => {
      loading.dismiss();
      this.dammit(err);
      })
  }

  dammit(e) {
    const alert = this.alertCtrl.create({
      title: 'Something went wrong',
      subTitle: 'Error' + JSON.stringify(e),
      buttons: ['Dismiss']
    });
    alert.present();
  }
}
