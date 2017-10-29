import { NgModule } from '@angular/core';

// Pipes
import { FromBase64Pipe } from './frombase64'

@NgModule({
  declarations: [ FromBase64Pipe ],
  exports: [FromBase64Pipe ]
})
export class PipesModule {}