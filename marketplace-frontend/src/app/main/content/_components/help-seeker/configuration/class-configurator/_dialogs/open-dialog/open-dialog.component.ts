import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Marketplace } from "app/main/content/_model/marketplace";
import { isNullOrUndefined } from "util";
import { LoginService } from "app/main/content/_service/login.service";
import { User, UserRole } from "app/main/content/_model/user";
import { ClassConfigurationService } from "app/main/content/_service/configuration/class-configuration.service";
import { ClassConfiguration } from "app/main/content/_model/meta/configurations";
import { Relationship } from "app/main/content/_model/meta/relationship";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import { RelationshipService } from "app/main/content/_service/meta/core/relationship/relationship.service";
import { ClassBrowseSubDialogData } from "../browse-sub-dialog/browse-sub-dialog.component";
import { GlobalInfo } from 'app/main/content/_model/global-info';

export interface OpenClassConfigurationDialogData {
  classConfiguration: ClassConfiguration;
  classDefinitions: ClassDefinition[];
  relationships: Relationship[];
  marketplace: Marketplace;
}

@Component({
  selector: "open-class-configuration-dialog",
  templateUrl: "./open-dialog.component.html",
  styleUrls: ["./open-dialog.component.scss"],
})
export class OpenClassConfigurationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<OpenClassConfigurationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OpenClassConfigurationDialogData,
    private classConfigurationService: ClassConfigurationService,
    private classDefinitionService: ClassDefinitionService,
    private relationshipService: RelationshipService,
    private loginService: LoginService,
  ) { }

  selected: string;
  allClassConfigurations: ClassConfiguration[];
  recentClassConfigurations: ClassConfiguration[];
  loaded: boolean;

  browseMode: boolean;
  browseDialogData: ClassBrowseSubDialogData;

  ngOnInit() {

    this.loginService.getGlobalInfo().toPromise().then((globalInfo: GlobalInfo) => {
      const tenantId = globalInfo.user.subscribedTenants.find(t => t.role === UserRole.HELP_SEEKER).tenantId;



      this.classConfigurationService
        .getClassConfigurationsByTenantId(this.data.marketplace, tenantId)
        .toPromise()
        .then((classConfigurations: ClassConfiguration[]) => {
          this.allClassConfigurations = classConfigurations.filter((c) => {
            return c.tenantId === tenantId;
          });

          this.recentClassConfigurations = this.allClassConfigurations;
          this.recentClassConfigurations = this.recentClassConfigurations.sort(
            (a, b) => b.timestamp.valueOf() - a.timestamp.valueOf()
          );

          if (this.recentClassConfigurations.length > 6) {
            this.recentClassConfigurations = this.recentClassConfigurations.slice(
              0,
              6
            );
          }
          this.loaded = true;
        });
    });
  }

  handleRowClick(c: ClassConfiguration) {
    this.data.classConfiguration = c;
    this.data.classDefinitions = [];
    this.data.relationships = [];

    Promise.all([
      this.classDefinitionService
        .getClassDefinitionsById(
          this.data.marketplace,
          c.classDefinitionIds,
          undefined
        )
        .toPromise()
        .then((classDefinitions: ClassDefinition[]) => {
          if (!isNullOrUndefined(classDefinitions)) {
            this.data.classDefinitions = classDefinitions;
          }
        }),
      this.relationshipService
        .getRelationshipsById(this.data.marketplace, c.relationshipIds)
        .toPromise()
        .then((relationships: Relationship[]) => {
          if (!isNullOrUndefined(relationships)) {
            this.data.relationships = relationships;
          }
        }),
    ]).then(() => {
      this.dialogRef.close(this.data);
    });
  }

  handleBrowseClick() {
    this.browseDialogData = new ClassBrowseSubDialogData();
    this.browseDialogData.marketplace = this.data.marketplace;
    this.browseDialogData.sourceReference = undefined;
    this.browseDialogData.title = "Klassen-Konfigurationen durchsuchen";

    this.browseDialogData.entries = [];

    for (const classConfiguration of this.allClassConfigurations) {
      this.browseDialogData.entries.push({
        id: classConfiguration.id,
        name: classConfiguration.name,
        date: classConfiguration.timestamp,
      });
    }

    this.browseMode = true;
  }

  handleBrowseBackClick() {
    this.browseMode = false;
  }

  handleReturnFromBrowse(event: { cancelled: boolean; entryId: string }) {
    console.log(event);
    if (!event.cancelled) {
      const selectedClassConfiguration = this.allClassConfigurations.find(
        (c) => c.id === event.entryId
      );

      this.handleRowClick(selectedClassConfiguration);
    } else {
      this.browseMode = false;
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
