import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Marketplace } from "app/main/content/_model/marketplace";
import { LoginService } from "app/main/content/_service/login.service";
import { ClassConfigurationService } from "app/main/content/_service/configuration/class-configuration.service";
import { ClassConfiguration } from "app/main/content/_model/meta/configurations";
import { FormControl, FormGroup } from "@angular/forms";
import { Relationship } from "app/main/content/_model/meta/relationship";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { RelationshipService } from "app/main/content/_service/meta/core/relationship/relationship.service";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import { stringUniqueValidator } from "app/main/content/_validator/string-unique.validator";
import { User, UserRole } from "app/main/content/_model/user";

export interface NewClassConfigurationDialogData {
  marketplace: Marketplace;

  classConfiguration: ClassConfiguration;
  relationships: Relationship[];
  classDefinitions: ClassDefinition[];
  tenantId: string;
}

@Component({
  selector: "new-class-configuration-dialog",
  templateUrl: "./new-dialog.component.html",
  styleUrls: ["./new-dialog.component.scss"],
})
export class NewClassConfigurationDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<NewClassConfigurationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: NewClassConfigurationDialogData,
    private classConfigurationService: ClassConfigurationService,
    private relationshipsService: RelationshipService,
    private classDefintionService: ClassDefinitionService,
    private loginService: LoginService
  ) {}
  dialogForm: FormGroup;
  allClassConfigurations: ClassConfiguration[];
  loaded = false;

  ngOnInit() {
    this.loginService
      .getLoggedIn()
      .toPromise()
      .then((helpseeker: User) => {
        this.classConfigurationService
          .getAllClassConfigurationsSortedDesc(this.data.marketplace)
          .toPromise()
          .then((classConfigurations: ClassConfiguration[]) => {
            this.data.tenantId = helpseeker.subscribedTenants.find(
              (t) => t.role === UserRole.HELP_SEEKER
            ).tenantId;
            this.allClassConfigurations = classConfigurations;

            this.dialogForm = new FormGroup({
              label: new FormControl(
                "",
                stringUniqueValidator(
                  this.allClassConfigurations.map((c) => c.name)
                )
              ),
              description: new FormControl(""),
              // rootLabel: new FormControl('')
            });

            // ----DEBUG
            // this.recentMatchingConfigurations.push(...this.recentMatchingConfigurations);
            // this.recentMatchingConfigurations.push(...this.recentMatchingConfigurations);
            // ----

            this.loaded = true;
          });
      });
  }

  displayErrorMessage(key: string) {
    if (key === "label") {
      return "Name bereits vorhanden";
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOKClick() {
    if (this.dialogForm.invalid) {
      this.dialogForm.get("label").markAsTouched();
      this.dialogForm.get("description").markAsTouched();
    } else {
      const name = this.dialogForm.get("label").value;
      const description = this.dialogForm.get("description").value;

      this.classConfigurationService
        .createNewClassConfiguration(
          this.data.marketplace,
          this.data.tenantId,
          name,
          description
        )
        .toPromise()
        .then((ret: ClassConfiguration) => {
          console.log(ret);
          this.data.classConfiguration = ret;
        })
        .then(() => {
          Promise.all([
            this.relationshipsService
              .getRelationshipsById(
                this.data.marketplace,
                this.data.classConfiguration.relationshipIds
              )
              .toPromise()
              .then((ret: Relationship[]) => {
                this.data.relationships = ret;
              }),
            this.classDefintionService
              .getClassDefinitionsById(
                this.data.marketplace,
                this.data.classConfiguration.classDefinitionIds,
                this.data.tenantId
              )
              .toPromise()
              .then((ret: ClassDefinition[]) => {
                this.data.classDefinitions = ret;
              }),
          ]).then(() => {
            this.dialogRef.close(this.data);
          });
        });
    }
  }
}
