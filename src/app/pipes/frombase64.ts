import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({name: 'fromBase64'})
export class FromBase64Pipe implements PipeTransform {
  constructor(public sanitizer: DomSanitizer) {}

  transform(url: string) {
    return url ? this.sanitizer.bypassSecurityTrustUrl(url) : "data:image/png;base64,ffff";
  }
}