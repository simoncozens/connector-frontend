import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, LoadingController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';

import { HomePage } from './pages/home/home';
import { LoginComponent } from './pages/login/login.component';
import { AuthService } from './services/auth.service';
import { OfflinePersonService } from './services/offline.person.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;

  pages: Array<{title: string, segment: string}>;

  constructor(public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private network: Network,
    public ops: OfflinePersonService,
    public translate: TranslateService,
    private auth: AuthService) {
    this.initializeApp();
    translate.setDefaultLang('en');
    translate.use('en');

    this.pages = [
      { title: 'Profiles', segment: "people" },
      { title: 'Starred Profiles', segment: "follows" },
      { title: 'Recently Visited', segment: "recent" },
      { title: 'Messages', segment: "inbox" },
      { title: 'My Profile', segment: "editprofile" },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (!this.auth.loggedIn()) {
        this.rootPage = LoginComponent;
      } else if (this.platform.is('cordova')) {
        console.log("Hello!")
        this.ops.openDb().then( () => {
          if (this.network.type != "none") { this.sync(); }
        });
      }
    });
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

  changeLocale(lang) {
    console.log("Using "+lang)
    this.translate.use(lang)
  }
}