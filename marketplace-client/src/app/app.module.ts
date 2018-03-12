import {NgModule} from '@angular/core';
import {AppMaterialModule} from './app-material.module';
import {AppRoutingModule} from './app-routing.module';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app/app.component';

import {TaskService} from './task/task.service';
import {TaskTypeService} from './task-type/task-type.service';
import {TaskCreateComponent} from './task/create/task-create.component';
import {TaskListComponent} from './task/list/task-list.component';
import {TaskTypeListComponent} from './task-type/list/task-type-list.component';
import {TaskTypeCreateComponent} from './task-type/create/task-type-create.component';

import {NavbarComponent} from './navbar/navbar.component';
import {TaskDetailsComponent} from './task/details/task-details.component';
import {TaskInteractionService} from './task-interaction/task-interaction.service';
import {TokenInterceptor} from './_interceptor/token.interceptor';
import {Http401Interceptor} from './_interceptor/http-401.interceptor';
import {LoginService} from './login/login.service';
import {LoginComponent} from './login/login.component';
import {TokenGuard} from './login/token.guard';
import {MessageService} from './_service/message.service';
import {TaskAvailableComponent} from './task/available/task-available.component';
import {RepositoryService} from './_service/repository.service';
import {TaskAssignComponent} from './task/assign/task-assign.component';
import {EmployeeGuard} from './participant/employee.guard';
import {VolunteerGuard} from './participant/volunteer.guard';
import {ParticipantService} from './participant/participant.service';
import {TaskInteractionHistoryComponent} from './task-interaction/task-interaction-history/task-interaction-history.component';
import {GermanDateAdapter} from './_adapter/german-date-adapter';
import {DateAdapter} from '@angular/material';
import {CompetenceService} from './competence/competence.service';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    TaskListComponent,
    TaskAvailableComponent,
    TaskCreateComponent,
    TaskDetailsComponent,
    TaskTypeListComponent,
    TaskTypeCreateComponent,
    TaskAssignComponent,
    TaskInteractionHistoryComponent
  ],
  imports: [
    AppMaterialModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    MessageService,
    TokenGuard,
    EmployeeGuard,
    VolunteerGuard,
    CompetenceService,
    LoginService,
    TaskService,
    TaskTypeService,
    TaskInteractionService,
    ParticipantService,
    RepositoryService,
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: Http401Interceptor, multi: true},
    {provide: DateAdapter, useClass: GermanDateAdapter}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

