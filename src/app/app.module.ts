import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { Http, HttpModule } from '@angular/http';
import { JwtModule } from '@auth0/angular-jwt';
import { HttpClientModule } from '@angular/common/http';

export function tokenGetter() {
  return localStorage.getItem('token');
}

import { Camera } from '@ionic-native/camera';
import { Network } from '@ionic-native/network';
import { Push } from '@ionic-native/push';
import { Device } from '@ionic-native/device';
import { Globalization } from '@ionic-native/globalization';
import { MyApp } from './app.component';
import { HomePage } from './pages/home/home';
import { ListPage } from './pages/list/list';
import { LoginComponent } from './pages/login/login.component';
import { PeopleModule } from './pages/people/people.module';
import { FollowsModule } from './pages/people/follows.module';
import { RecentModule } from './pages/people/recent.module';
import { PersonModule } from './pages/person/person.module';
import { MyProfileModule } from './pages/person/myprofile.module';
import { InboxModule } from './pages/inbox/inbox.module';
import { MessagesWithModule } from './pages/messages-with/messages-with.module';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { PersonService } from './services/person.service';
import { MessageService } from './services/message.service';
import { InterComponentMessageService } from './services/intercomponentmessage.service';
import { NotificationService } from './services/notification.service';
import { OfflinePersonService } from './services/offline.person.service';
import { AuthModule } from './services/auth.module';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth-guard.service';
import { SQLite } from '@ionic-native/sqlite';
import { UniqueDeviceID } from '@ionic-native/unique-device-id';

import { TranslateModule, TranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateStore } from "@ngx-translate/core/src/translate.store";
import { Contacts } from '@ionic-native/contacts';

import { PipesModule } from './pipes/pipes.module'

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ["localhost:3000", "127.0.0.1:3000", 'connector-dev.herokuapp.com'],
      }
    }),
    AuthModule,
    PeopleModule,
    PersonModule,
    MyProfileModule,
    FollowsModule,
    RecentModule,
    InboxModule,
    MessagesWithModule,
    PipesModule,
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
    LoginComponent
  ],
  providers: [
    PersonService, AuthService, AuthGuard, OfflinePersonService,
    MessageService, InterComponentMessageService,
    StatusBar, Network, Push, Device, NotificationService,
    Globalization, Camera,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    TranslateModule, TranslateService, TranslateStore,
    SQLite, Contacts, UniqueDeviceID
  ]
})
export class AppModule {}
