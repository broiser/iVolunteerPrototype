import { NgModule } from "@angular/core";

import { OrganizationRegistrationComponent } from "./registration.component";
import { RouterModule } from "@angular/router";
import { FuseSharedModule } from "@fuse/shared.module";
import {
  MatButtonModule,
  MatCheckboxModule,
  MatFormFieldModule,
  MatInputModule,
  MatDatepickerModule,
  MatNativeDateModule,
} from "@angular/material";

const routes = [{ path: "", component: OrganizationRegistrationComponent }];

@NgModule({
  imports: [
    RouterModule.forChild(routes),

    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,

    FuseSharedModule,
  ],
  exports: [],
  declarations: [OrganizationRegistrationComponent],
  providers: [],
})
export class OrganizationRegistrationModule { }
