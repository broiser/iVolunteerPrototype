import {NgModule} from '@angular/core';
import {FuseSuggestionsComponent} from './suggestions.component';
import {FuseSharedModule} from '../../../../../@fuse/shared.module';
import {FuseWidgetModule} from '../../../../../@fuse/components';
import {
  MatButtonModule, MatDividerModule, MatExpansionModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatRadioModule,
  MatSidenavModule
} from '@angular/material';


@NgModule({

  declarations: [
    FuseSuggestionsComponent
  ],
  imports: [
    FuseSharedModule,
    FuseWidgetModule,

    MatFormFieldModule,
    MatRadioModule,
    MatInputModule,
    MatMenuModule,
    MatExpansionModule,
    MatSidenavModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule
  ],
  exports: [
    FuseSuggestionsComponent
  ]
})

export class FuseSuggestionsModule {
}
