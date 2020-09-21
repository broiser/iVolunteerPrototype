import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, } from '@angular/material/dialog';
import { MatTableDataSource, MatSort } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { isNullOrUndefined } from 'util';
import { GlobalInfo } from 'app/main/content/_model/global-info';
import { LoginService } from 'app/main/content/_service/login.service';
import { Tenant } from 'app/main/content/_model/tenant';
import { User, UserRole } from 'app/main/content/_model/user';
import { CoreUserService } from 'app/main/content/_service/core-user.serivce';

export interface AddHelpseekerDialogData {
  addedHelpseekers: User[];
}

@Component({
  selector: "add-helpseeker-dialog",
  templateUrl: './add-helpseeker-dialog.component.html',
  styleUrls: ['./add-helpseeker-dialog.component.scss'],
})
export class AddHelpseekerDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<AddHelpseekerDialogData>,
    @Inject(MAT_DIALOG_DATA)
    public data: AddHelpseekerDialogData,
    public dialog: MatDialog,
    private loginService: LoginService,
    private coreUserService: CoreUserService,
  ) { }

  datasource = new MatTableDataSource<User>();
  displayedColumns = ['checkbox', 'name'];

  allHelpseekers: User[];

  selection = new SelectionModel<User>(true, []);

  loaded: boolean;

  globalInfo: GlobalInfo;
  tenant: Tenant;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  async ngOnInit() {

    this.globalInfo = <GlobalInfo>(
      await this.loginService.getGlobalInfo().toPromise()
    );

    this.tenant = this.globalInfo.tenants[0];


    this.coreUserService.findAllByRoles([UserRole.NONE, UserRole.VOLUNTEER, UserRole.HELP_SEEKER], true).toPromise().then((ret: User[]) => {
      console.log(ret);
      this.allHelpseekers = ret;
      this.datasource.data = ret;

      this.loaded = true;
    });

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.datasource.filter = filterValue.trim().toLowerCase();
  }

  onRowClick(row: User) {

    this.selection.isSelected(row) ? this.selection.deselect(row) : this.selection.select(row);
  }

  onSubmit() {
    // Add selected, but filter out existing ones

  }


}
