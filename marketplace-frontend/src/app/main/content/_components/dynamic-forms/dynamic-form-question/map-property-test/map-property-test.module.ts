import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapPropertyTestComponent } from './map-property-test.component';
import { FuseSharedModule } from "@fuse/shared.module";
import { RouterModule, Route } from '@angular/router';
import { AgmCoreModule } from '@agm/core';
import { MatInputModule, MatButtonModule, MatCommonModule, MatFormFieldModule } from '@angular/material';


const routes: Route[] = [
  {path: '', component: MapPropertyTestComponent}
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FuseSharedModule,
    
    MatCommonModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,

    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDiwSZ8L-1r9TXW_q5UTK_--GE2MKHK-jE'
      
    })
  ],
  declarations: [MapPropertyTestComponent]
})
export class MapPropertyTestModule { }
