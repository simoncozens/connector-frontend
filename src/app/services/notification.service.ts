import { Device } from '@ionic-native/device';
import { Push, PushObject, PushOptions } from '@ionic-native/push';
import { AppSettings } from '../app.settings';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class NotificationService {
  private addDeviceUrl = AppSettings.API_ENDPOINT + '/people/add_device';

  constructor (
    public http: HttpClient,
    public push: Push,
    public device: Device
    ) { }

  init () {
    const options: PushOptions = {
      android: {
      }
    };
    const pushObject: PushObject = this.push.init(options);
    pushObject.on('registration').subscribe((registration: any) => {
      this.saveToken(registration.registrationId);
    });
  }

  saveToken(token) {
    const device = {
        platform: this.device.platform,
        model: this.device.model,
        uuid: this.device.uuid,
        token: token
    };
    console.log("Sending token ", token)
    return this.http
      .post(this.addDeviceUrl, {params: { device: device}} )
      .toPromise()
  }
}
