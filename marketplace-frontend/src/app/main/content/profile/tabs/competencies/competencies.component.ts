import { AfterViewInit, Component, OnInit } from '@angular/core';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import * as Chart from 'chart.js';
import { Volunteer } from '../../../_model/volunteer';
import { VolunteerProfile, CompetenceTableRow } from '../../../_model/volunteer-profile';
import { VolunteerProfileService } from '../../../_service/volunteer-profile.service';
import { VolunteerRepositoryService } from '../../../_service/volunteer-repository.service';
import { isNullOrUndefined, isArray } from 'util';
import { TaskEntry } from '../../../_model/task-entry';
import { CompetenceEntry } from '../../../_model/competence-entry';
import { LoginService } from '../../../_service/login.service';
import { ArrayService } from '../../../_service/array.service';
import { CoreMarketplaceService } from '../../../_service/core-marketplace.service';
import { ActivatedRoute } from '@angular/router';
import { Marketplace } from '../../../_model/marketplace';
import { Participant } from '../../../_model/participant';
import { CoreVolunteerService } from '../../../_service/core-volunteer.service';
import { isEmpty } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { MatTableDataSource } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { Competence } from '../../../_model/competence';

@Component({
  selector: 'fuse-profile-competencies',
  templateUrl: './competencies.component.html',
  styleUrls: ['./competencies.component.scss'],
  animations: fuseAnimations
})
export class FuseProfileCompetenciesComponent implements OnInit, AfterViewInit {
  canvas: any;
  ctx: any;

  dataSource: MatDataSource;

  columns = [
    { columnDef: 'name', header: 'Name', cell: (row: CompetenceEntry) => `${row.competenceName}` },
  ];
  displayedColumns: any[];

  competencies: CompetenceEntry[] = [];

  private volunteer: Volunteer;
  private publicProfiles: VolunteerProfile[] = [];
  private privateProfile: VolunteerProfile;

  public commonProfile: VolunteerProfile;

  marketplaces: Marketplace[] = [];

  constructor(
    private arrayService: ArrayService,
    private route: ActivatedRoute,
    private loginService: LoginService,
    private marketplaceService: CoreMarketplaceService,
    private coreVolunteerService: CoreVolunteerService,
    private volunteerProfileService: VolunteerProfileService,
    private volunteerRepositoryService: VolunteerRepositoryService) {

  }

  ngOnInit() {
    this.commonProfile = new VolunteerProfile();
    this.commonProfile.competenceList = [];

    this.loginService.getLoggedIn().toPromise().then((volunteer: Participant) => {
      const selected_marketplaces = JSON.parse(localStorage.getItem('marketplaces'));
      this.volunteer = volunteer;
      if (!isArray(selected_marketplaces)) {
        return;
      }

      selected_marketplaces.forEach((mp: Marketplace)=> {
        this.columns.push({columnDef: mp.id, header: mp.name, cell: (row: CompetenceEntry) => `...` })
      })


      // this.coreVolunteerService.findRegisteredMarketplaces(volunteer.id)
      //   .toPromise()
      //   .then((marketplaces: Marketplace[]) => {
      //     marketplaces
      //       .filter(mp => selected_marketplaces.find(selected_mp => selected_mp.id === mp.id))
      //       .forEach(mp => {
      //         this.loadPublicVolunteerProfile(this.volunteer, mp);
      //       });
      //   });

      this.volunteerRepositoryService.findByVolunteer(volunteer)
        .toPromise()
        .then((volunteerProfile: VolunteerProfile) => {
          this.privateProfile = volunteerProfile;
          this.onLoadingComplete();
        });
    });
  }

  ngAfterViewInit() {
    // this.canvas = document.getElementById('myChart');
    // this.ctx = this.canvas.getContext('2d');
    // const myChart = new Chart(this.ctx, {
    //   type: 'radar',
    //   data: {
    //     labels: ['Professional skills', 'Methodical expertise', 'Social skills', 'Self competences'],
    //     datasets: [{
    //       label: 'You',
    //       backgroundColor: 'rgba(200,0,0,0.2)',
    //       data: [14, 10, 10, 8]
    //     }]
    //   },
    //   options: {}
    // });
  }

  private loadPublicVolunteerProfile(volunteer: Volunteer, marketplace: Marketplace) {
    return this.volunteerProfileService.findByVolunteer(volunteer, marketplace.url)
      .toPromise()
      .then((volunteerProfile: VolunteerProfile) => {
        this.publicProfiles.push(volunteerProfile);
        this.onLoadingComplete();
      });
  }

  private onLoadingComplete() {

    this.dataSource = new MatDataSource(this.privateProfile.competenceList);
    this.displayedColumns = this.columns.map(x => x.columnDef);

    // this.publicProfiles.forEach(pp => {
    //   pp.competenceList.forEach( c => {
    //     if(this.dataSource.find(row => row.competenceId === c.competenceId)){
    //       this.dataSource[]
    //     }
    //   })
    // })

    // if (isNullOrUndefined(this.publicProfiles)) {
    //   return;
    // }
    // if (isNullOrUndefined(this.privateProfile) && !isNullOrUndefined(this.publicProfiles)) {
    //   this.handlePublicProfiles();
    // } else {
    //   this.handlePublicProfiles();
    //   this.commonProfile.competenceList = this.arrayService.concat(this.privateProfile.competenceList, this.commonProfile.competenceList);
    // }
    // console.error(this.commonProfile);
  }

  // private handlePublicProfiles() {
  //   if (!this.commonProfile.competenceList) {
  //     this.commonProfile.competenceList = [];
  //   }
  //   this.publicProfiles.forEach(p => {
  //     this.commonProfile.competenceList = this.arrayService.concat(this.commonProfile.competenceList, p.competenceList);
  //   });
  // }


  // containsTaskInPublic(taskEntry: TaskEntry) {
  //   return !isNullOrUndefined(this.publicProfile) && this.arrayService.contains(this.publicProfile.taskList, taskEntry);
  // }
  // 
  // containsTaskInPrivate(taskEntry: TaskEntry) {
  //   return !isNullOrUndefined(this.privateProfile) && this.arrayService.contains(this.privateProfile.taskList, taskEntry);
  // }

  // containsCompetenceInPublic(competenceEntry: CompetenceEntry) {
  //   return !isNullOrUndefined(this.publicProfile) && this.arrayService.contains(this.publicProfile.competenceList, competenceEntry);
  // }

  // containsCompetenceInPrivate(competenceEntry: CompetenceEntry) {
  //   return !isNullOrUndefined(this.privateProfile) && this.arrayService.contains(this.privateProfile.competenceList, competenceEntry);
  // }

  // shareTask(taskEntry: TaskEntry) {
  //   this.volunteerProfileService.shareTaskByVolunteer(this.volunteer, taskEntry, this.marketplaces[0].url).toPromise().then(() => {
  //     alert('Task is published to marketplace.');
  //     this.publicProfile.taskList.push(taskEntry);
  //   });
  // }

  // revokeTask(taskEntry: TaskEntry) {
  //   this.volunteerProfileService.revokeTaskByVolunteer(this.volunteer, taskEntry, this.marketplaces[0].url).toPromise().then(() => {
  //     alert('Task is revoked from marketplace.');
  //     this.publicProfile.taskList = this.publicProfile.taskList.filter((task: TaskEntry) => task.id !== taskEntry.id);
  //   });
  // }

  // synchronizeTask(taskEntry: TaskEntry) {
  //   this.volunteerRepositoryService.synchronizeTask(this.volunteer, taskEntry).toPromise().then(() => {
  //     alert('Task is synchronized to local repository.');
  //     this.privateProfile.taskList.push(taskEntry);
  //   });
  // }

  // shareCompetence(competenceEntry: CompetenceEntry) {
  //   this.volunteerProfileService.shareCompetenceByVolunteer(this.volunteer, competenceEntry, this.marketplaces[0].url).toPromise().then(() => {
  //     alert('Competence is published to marketplace.');
  //     this.publicProfile.competenceList.push(competenceEntry);
  //   });
  // }

  // revokeCompetence(competenceEntry: CompetenceEntry) {
  //   this.volunteerProfileService.revokeCompetenceByVolunteer(this.volunteer, competenceEntry, this.marketplaces[0].url).toPromise().then(() => {
  //     alert('Competence is revoked from marketplace.');
  //     this.publicProfile.competenceList = this.publicProfile.competenceList
  //       .filter((competence: CompetenceEntry) => competence.id !== competenceEntry.id);
  //   });
  // }

  // synchronizeCompetence(competenceEntry: CompetenceEntry) {
  //   this.volunteerRepositoryService.synchronizeCompetence(this.volunteer, competenceEntry).toPromise().then(() => {
  //     alert('Competence is synchronized to local repository.');
  //     this.privateProfile.competenceList.push(competenceEntry);
  //   });
  // }

}


export class MatDataSource extends DataSource<CompetenceEntry> {

  constructor(
    private competencies: CompetenceEntry[]
  ) {
    super();
  }

  connect(): Observable<CompetenceEntry[]> {
    return of(this.competencies);
  }

  disconnect() { }
}