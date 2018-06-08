import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, LoadingController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';

import { PeopleComponent } from './pages/people/people';
import { LoginComponent } from './pages/login/login.component';
import { AuthService } from './services/auth.service';
import { OfflinePersonService } from './services/offline.person.service';
import { NotificationService } from './services/notification.service';
import {TranslateService} from '@ngx-translate/core';
import { Globalization } from '@ionic-native/globalization';
import { Events } from 'ionic-angular';

import { JwtHelperService } from '@auth0/angular-jwt';

interface MenuPage {
  title: string, segment: string, adminOnly?:boolean, onlineOnly: boolean, disabled?:boolean
}
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LoginComponent;

  pages: Array<MenuPage>;
  availablePages: Array<MenuPage>;

  constructor(public platform: Platform,
    private globalization: Globalization,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public jwtHelper: JwtHelperService,
    private network: Network,
    public ops: OfflinePersonService,
    public notificationService: NotificationService,
    public translate: TranslateService,
    public events: Events,
    private auth: AuthService) {
    this.initializeApp();
    this.setupLanguage();
    this.availablePages = [
      { title: 'Profiles', segment: "people", onlineOnly: false },
      { title: 'Starred Profiles', segment: "follows", onlineOnly: false },
      { title: 'Recently Visited', segment: "recent", onlineOnly: false },
      { title: 'Messages', segment: "inbox", onlineOnly: true, disabled:true }, // For now
      { title: 'Register User', segment: "register", onlineOnly: true, adminOnly:true },
      { title: 'My Profile', segment: "myprofile", onlineOnly: true },
    ];
    events.subscribe('loggedIn', () => this.setupPages());
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.setupPages()
      this.ops.openDb().then( () => {
        var token = localStorage.getItem('token');
        if (token) {
          console.log("Token",this.jwtHelper.decodeToken(token)); // token
          console.log("Expires",this.jwtHelper.getTokenExpirationDate(token)); // token
        }
        if (!token || !this.auth.loggedIn()) {
          this.rootPage = LoginComponent;
        } else {
          this.rootPage = PeopleComponent;
          if (this.platform.is('cordova')) {
            console.log("Hello!")
            if (this.network.type != "none" && this.network.type != "unknown") {
              this.notificationService.init()
              this.sync();
            }
          }
        }
      });
      if (this.platform.is("cordova")) {
        this.network.onchange().subscribe(this.setupPages)
      }
    });
  }

  setupPages() {
    var online = (!this.platform.is('cordova') ||
    (this.network.type != "none" && this.network.type != "unknown"))
    this.pages = this.availablePages;
    if (!online) {
      this.pages = this.pages.filter((p) => !p.onlineOnly)
    }
    console.log("Testing if admin")
    if (!this.auth.adminUser()) {
      console.log("Not admin!")
      this.pages = this.pages.filter((p) => !p.adminOnly)
    }
    console.log(this.pages)
  }

  sync() {
    const loading = this.loadingCtrl.create({
      content: 'Syncing...'
    });
    loading.present();
    this.ops.sync().then( () => {
      loading.dismiss();
    }, (err) => {
      loading.dismiss();
      this.dammit(err);
      })
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.push(page.segment).then(cando => {
      if(!cando) this.nav.setRoot(LoginComponent, {"next": page.segment } )
    });
  }

  dammit(e) {
    const alert = this.alertCtrl.create({
      title: 'Something went wrong',
      subTitle: 'Error' + JSON.stringify(e),
      buttons: ['Dismiss']
    });
    alert.present();
  }

  setupLanguage() {
    this.translate.setDefaultLang('en');
    var l = localStorage.getItem('lang');
    if (l) {
      this.translate.use(l);
      return;
    }
    this.globalization.getPreferredLanguage().then(res => {
      console.log(res);
      this.translate.use(res.value);
    }).catch(e => {
      console.log(e);
      this.translate.use('en');
    });

  }
  changeLocale(lang) {
    console.log("Using "+lang)
    localStorage.setItem("lang", lang);
    this.translate.use(lang)
  }

  logout() {
    this.auth.logOut();
    this.rootPage = LoginComponent;
    this.setupPages();
  }
}