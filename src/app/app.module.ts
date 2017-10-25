import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Http, HttpModule, Response } from '@angular/http';
import { Network } from '@ionic-native/network';

import { MyApp } from './app.component';
import { HomePage } from './pages/home/home';
import { ListPage } from './pages/list/list';
import { LoginComponent } from './pages/login/login.component';
import { PeopleComponent } from './pages/people/people';
import { FollowsComponent } from './pages/people/follows';
import { PersonComponent } from './pages/person/person.component';
import { InboxComponent } from './pages/inbox/inbox.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PersonService } from './services/person.service';
import { OfflinePersonService } from './services/offline.person.service';
import { AuthModule } from './services/auth.module';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { SQLite } from '@ionic-native/sqlite';

import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateStore } from "@ngx-translate/core/src/translate.store";
import { Contacts } from '@ionic-native/contacts';

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    PeopleComponent,FollowsComponent,
    PersonComponent,InboxComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    AuthModule,
    TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [Http]
        }
      })
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    PeopleComponent, FollowsComponent, InboxComponent,
    PersonComponent,
    LoginComponent
  ],
  providers: [
    PersonService, AuthService, AuthGuard, OfflinePersonService,
    StatusBar, Network,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    TranslateModule, TranslateService, TranslateStore,
    SQLite, Contacts
  ]
})
export class AppModule {}
