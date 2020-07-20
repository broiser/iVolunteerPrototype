import { Component, OnInit } from "@angular/core";
import { Marketplace } from "app/main/content/_model/marketplace";
import { UserRole, User } from "app/main/content/_model/user";
import { FormGroup, FormBuilder, FormControl, Validators, FormArrayName, FormArray } from "@angular/forms";
import {
  DerivationRule,
  GeneralCondition,
  ClassCondition,
  ClassAction,
} from "app/main/content/_model/derivation-rule";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginService } from "app/main/content/_service/login.service";
import { CoreHelpSeekerService } from "app/main/content/_service/core-helpseeker.service";
import { DerivationRuleService } from "app/main/content/_service/derivation-rule.service";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import { Tenant } from "app/main/content/_model/tenant";
import { TenantService } from "app/main/content/_service/core-tenant.service";
import { RuleExecution } from "app/main/content/_model/derivation-rule-execution";
import { DerivationRuleValidators } from 'app/main/content/_validator/derivation-rule.validators';

@Component({
  templateUrl: "./rule-configurator.component.html",
  styleUrls: ["./rule-configurator.component.scss"],
  providers: [],
})
export class FuseRuleConfiguratorComponent implements OnInit {
  helpseeker: User;
  marketplace: Marketplace;
  role: UserRole;
  ruleForm: FormGroup;

  derivationRule: DerivationRule;

  testConditions = false;
  showSuccessMsg = false;
  deactivateSubmit = false;
  ruleExecutions: RuleExecution[];

  classDefinitions: ClassDefinition[] = [];

  // ruleActionForm: FormGroup[] = [];
  
  ruleValidationMessages = DerivationRuleValidators.ruleValidationMessages;

  tenant: Tenant;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private loginService: LoginService,
    private helpSeekerService: CoreHelpSeekerService,
    private formBuilder: FormBuilder,
    private derivationRuleService: DerivationRuleService,
    private classDefinitionService: ClassDefinitionService,
    private tenantService: TenantService
  ) {
    this.ruleForm = formBuilder.group({
      id: new FormControl(undefined),
      name: new FormControl(undefined, [Validators.required, Validators.minLength(5)]),
      genConditionForms: new FormArray([]),
      classConditionForms: new FormArray([])
    });
  }

  async ngOnInit() {
    let genConditionForms = <FormArray>this.ruleForm.controls['genConditionForms'];  
    this.helpseeker = <User>await this.loginService.getLoggedIn().toPromise();

    this.marketplace = <Marketplace>(
      await this.helpSeekerService
        .findRegisteredMarketplaces(this.helpseeker.id)
        .toPromise()
    );

    this.route.params.subscribe((params) => {
      this.loadDerivationRule(this.marketplace, params["ruleId"]);
    });

    this.classDefinitions = <ClassDefinition[]>(
      await this.classDefinitionService
        .getAllClassDefinitionsWithoutHeadAndEnums(
          this.marketplace,
          this.helpseeker.subscribedTenants.find(
            (t) => t.role === UserRole.HELP_SEEKER
          ).tenantId
        )
        .toPromise()
    );

    this.tenant = <Tenant>(
      await this.tenantService
        .findById(
          this.helpseeker.subscribedTenants.find(
            (t) => t.role === UserRole.HELP_SEEKER
          ).tenantId
        )
        .toPromise()
    );
  }

  private loadDerivationRule(marketplace: Marketplace, ruleId: string) {
    if (ruleId) {
      this.derivationRuleService
        .findById(
          marketplace,
          ruleId
        )
        .toPromise()
        .then((rule: DerivationRule) => {
          this.derivationRule = rule;
          this.ruleForm.patchValue({
            id: this.derivationRule.id,
            name: this.derivationRule.name,
          });
        });
        this.deactivateSubmit = true;
    } else {
      // init derivation rule
      this.derivationRule = new DerivationRule();
      this.derivationRule.generalConditions = new Array();
      this.derivationRule.classActions = new Array();
      this.derivationRule.classActions.push(new ClassAction(null));
      this.derivationRule.conditions = new Array();
    }
  }

  private loadDerivationRuleByName(marketplace: Marketplace, tenantId: string, container: string, ruleName: string){
    this.derivationRuleService
        .findByContainerAndName(marketplace, tenantId, container, ruleName)
        .toPromise()
        .then((rule: DerivationRule) => {
          this.derivationRule = rule;
          this.router.navigate(["/main/rule/" + this.derivationRule.id]);
          this.ruleForm.patchValue({
            id: this.derivationRule.id,
            name: this.derivationRule.name,
          });
        });
  }

  private initDerivationRule(){
    this.derivationRule = new DerivationRule();
      this.derivationRule.generalConditions = new Array();
      this.derivationRule.classActions = new Array();
      this.derivationRule.classActions.push(
        new ClassAction(null)
      );
      //this.ruleActionForm.push(new FormGroup({}));
      this.derivationRule.conditions = new Array();
  }

  onChangeGeneralCondition(generalCondition: GeneralCondition){
    this.deactivateSubmit = false;
  }

  onChangeClassCondition(classCondition: ClassCondition){
    this.deactivateSubmit = false;
  }

  onChangeClassAction(classAction: ClassAction){
    this.deactivateSubmit = false;
  }

  test(){
    this.testConditions = true;
    this.derivationRule.name = this.ruleForm.value.name;
    this.derivationRule.tenantId = this.helpseeker.subscribedTenants.find(
      (t) => t.role === UserRole.HELP_SEEKER
    ).tenantId;
    this.derivationRule.container =
      "simulate execution " + this.derivationRule.name;
  }

  save() {
    this.ruleForm.markAllAsTouched();
    
    if (this.ruleForm.valid) {     
      if (this.ruleForm.value.name &&
          this.derivationRule.classActions[0].classDefinition
      ) {
        this.derivationRule.name = this.ruleForm.value.name;
        this.derivationRule.tenantId = this.helpseeker.subscribedTenants.find(
        (t) => t.role === UserRole.HELP_SEEKER
      ).tenantId;
        this.derivationRule.container = "Test-Frontend";

        this.derivationRuleService
          .save(this.marketplace, this.derivationRule)
          .toPromise()
          .then(() => {
              this.showSuccessMsg = true;
                if (this.derivationRule.id){
                 // window.location.reload()
                  this.loadDerivationRule(this.marketplace, this.derivationRule.id);
                } else {
                  this.loadDerivationRuleByName(this.marketplace, 
                                                this.derivationRule.tenantId, 
                                                this.derivationRule.container,
                                                this.derivationRule.name);
                }
            }
          );
      }
      //this.ruleForm.reset();
      this.testConditions = false;
    } 
  }

  navigateBack() {
    window.history.back();
  }

  onChange($event){
    this.testConditions = false; 
    this.deactivateSubmit = false;
  }

  onChangeName() {
      this.derivationRule.name = this.ruleForm.value.name;
      this.deactivateSubmit = false;
  }

  addGeneralCondition() {
    this.derivationRule.generalConditions.push(
      new GeneralCondition()
    );
    this.deactivateSubmit = false;
  }

  addClassCondition() {
    this.derivationRule.conditions.push(
      new ClassCondition()
      );
    this.deactivateSubmit = false;
  }
}
