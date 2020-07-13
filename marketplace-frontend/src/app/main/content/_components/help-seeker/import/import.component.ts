import { Component, OnInit } from "@angular/core";
import { LoginService } from "app/main/content/_service/login.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { Marketplace } from "app/main/content/_model/marketplace";
import { UserRole, User } from "app/main/content/_model/user";
import { CoreHelpSeekerService } from "app/main/content/_service/core-helpseeker.service";
import { CoreVolunteerService } from "app/main/content/_service/core-volunteer.service";
import { ClassInstanceService } from "app/main/content/_service/meta/core/class/class-instance.service";
import { Tenant } from "app/main/content/_model/tenant";
import { TenantService } from "app/main/content/_service/core-tenant.service";
import { GlobalInfo } from "app/main/content/_model/global-info";

@Component({
  selector: "import",
  templateUrl: "import.component.html",
  styleUrls: ["import.component.scss"],
})
export class ImportComponent implements OnInit {
  classDefinitions: ClassDefinition[] = [];
  volunteers: User[] = [];
  helpseeker: User;
  marketplace: Marketplace;
  role: UserRole;
  importForm: FormGroup;

  inputMissingError: boolean = false;
  displaySuccessMessage: boolean = false;
  successImportCount: number;

  tenant: Tenant;

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private helpSeekerService: CoreHelpSeekerService,
    private volunteerService: CoreVolunteerService,
    private classInstanceService: ClassInstanceService,
    private classDefinitionService: ClassDefinitionService,
    private tenantService: TenantService
  ) {
    this.importForm = formBuilder.group({
      volunteer: new FormControl(undefined, Validators.required),
      file: new FormControl(undefined, Validators.required),
    });
  }

  async ngOnInit() {
    let globalInfo = <GlobalInfo>(
      await this.loginService.getGlobalInfo().toPromise()
    );
    this.marketplace = globalInfo.marketplace;
    this.helpseeker = globalInfo.user;
    this.tenant = globalInfo.tenants[0]; // Philipp: not that nice...

    this.classDefinitions = <ClassDefinition[]>(
      await this.classDefinitionService
        .getAllClassDefinitionsWithoutRootAndEnums(
          this.marketplace,
          this.helpseeker.subscribedTenants.find(
            (t) => t.role === UserRole.HELP_SEEKER
          ).tenantId
        )
        .toPromise()
    );

    this.volunteers = <User[]>(
      await this.volunteerService
        .findAllByTenantId(
          this.helpseeker.subscribedTenants.find(
            (t) => t.role === UserRole.HELP_SEEKER
          ).tenantId
        )
        .toPromise()
    );
  }

  async save() {
    if (!this.importForm.valid) {
      this.inputMissingError = true;
    } else {
      this.inputMissingError = false;
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const contentObject = JSON.parse(<string>fileReader.result);
        let cd: ClassDefinition = <ClassDefinition>(
          await this.classDefinitionService
            .getClassDefinitionById(
              this.marketplace,
              contentObject.classDefinitionId,
              contentObject.tenantId
            )
            .toPromise()
        );

        if (cd) {
          this.import(contentObject);
        }
      };
      fileReader.readAsText(this.importForm.value.file.files[0]);
    }
  }

  async import(contentObject) {
    this.successImportCount = contentObject.properties.length;
    this.displaySuccessMessage = true;

    for (const entry of contentObject.properties) {
      await this.classInstanceService
        .createClassInstanceByClassDefinitionId(
          this.marketplace,
          contentObject.classDefinitionId,
          this.importForm.value.volunteer.id,
          contentObject.tenantId,
          entry
        )
        .toPromise();
    }

    setTimeout(() => (this.displaySuccessMessage = false), 5000);
  }
}
