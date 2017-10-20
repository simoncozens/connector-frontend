import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpModule } from '@angular/http';
import { Network } from '@ionic-native/network';

import { MyApp } from './app.component';
import { HomePage } from './pages/home/home';
import { ListPage } from './pages/list/list';
import { LoginComponent } from './pages/login/login.component';
import { PeopleComponent } from './pages/people/people';
import { PersonComponent } from './pages/person/person.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PersonService } from './services/person.service';
import { OfflinePersonService } from './services/offline.person.service';
import { AuthModule } from './services/auth.module';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { SQLite } from '@ionic-native/sqlite';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    PeopleComponent,
    PersonComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    AuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    PeopleComponent,
    PersonComponent,
    LoginComponent
  ],
  providers: [
    PersonService, AuthService, AuthGuard, OfflinePersonService,
    StatusBar, Network,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    SQLite
  ]
})
export class AppModule {}
