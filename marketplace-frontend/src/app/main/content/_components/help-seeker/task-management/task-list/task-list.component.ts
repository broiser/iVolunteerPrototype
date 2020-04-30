
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Marketplace } from 'app/main/content/_model/marketplace';
import { ClassInstanceDTO } from 'app/main/content/_model/meta/class';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { Participant } from 'app/main/content/_model/participant';
import { Router } from '@angular/router';
import { LoginService } from 'app/main/content/_service/login.service';
import { CoreHelpSeekerService } from 'app/main/content/_service/core-helpseeker.service';
import { ClassInstanceService } from 'app/main/content/_service/meta/core/class/class-instance.service';
import { TenantService } from 'app/main/content/_service/core-tenant.service';
import { Task } from 'app/main/content/_model/task';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'fuse-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  animations: fuseAnimations
})
export class FuseTaskListComponent implements OnInit, AfterViewInit {
  marketplace: Marketplace;

  private classInstanceDTOs: ClassInstanceDTO[] = [];
  private tableDataSource = new MatTableDataSource<ClassInstanceDTO>();
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  private displayedColumns: string[] = [
    'taskName',
    'taskType1',
    'taskType2',
    'taskDateFrom',
    'taskDuration',
    'verified'
  ];

  private participant: Participant;

  private tenantName = 'FF Eidenberg';
  private tenantId: string;

  constructor(
    private router: Router,
    private loginService: LoginService,
    private helpSeekerService: CoreHelpSeekerService,
    private classInstanceService: ClassInstanceService,
    private coreTenantService: TenantService
  ) { }

  ngOnInit() { }

  ngAfterViewInit(): void {
    this.loadAllTasks();
  }

  onRowSelect(task: Task) {
    // TODO @ALEX if edit of classInstances works ...
    // this.router.navigate(['/main/task/' + task.marketplaceId + '/' + task.id]);
  }

  private loadAllTasks() {
    this.loginService
      .getLoggedIn()
      .toPromise()
      .then((participant: Participant) => {
        this.participant = participant;
        this.helpSeekerService
          .findRegisteredMarketplaces(participant.id)
          .toPromise()
          .then((marketplace: Marketplace) => {
            if (!isNullOrUndefined(marketplace)) {
              this.marketplace = marketplace;

              this.coreTenantService
                .findByName(this.tenantName)
                .toPromise()
                .then((tenantId: string) => {
                  this.tenantId = tenantId;

                  // TODO Philipp: commented out, since the component isn't used anywhere!?

                  // this.classInstanceService.getClassInstancesByArcheType(this.marketplace, 'TASK', this.tenantId).toPromise().then((ret: ClassInstanceDTO[]) => {
                  //   if (!isNullOrUndefined(ret)) {
                  //     this.classInstanceDTOs = ret;
                  //     this.paginator.length = this.classInstanceDTOs.length;
                  //     this.tableDataSource.data = this.classInstanceDTOs;
                  //     this.tableDataSource.paginator = this.paginator;
                  //   }
                  // });
                });
            }
          });
      });
  }

  addTask() {
    this.router.navigate(['/main/task-select']);
  }

  private isFF() {
    return this.participant.username == 'FFA';
  }

  private isMV() {
    return this.participant.username === 'MVS';
  }
  private isOther() {
    return !this.isFF() && !this.isMV();
  }
}
