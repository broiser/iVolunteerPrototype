import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";

import { LoginService } from "../../../../../_service/login.service";
import { User, UserRole } from "../../../../../_model/user";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  FormGroupDirective,
  ControlContainer,
  FormArray,
  Validators,
} from "@angular/forms";
import { Marketplace } from "app/main/content/_model/marketplace";
import {
  ComparisonOperatorType,
  AttributeCondition,
} from "app/main/content/_model/derivation-rule";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import {
  ClassProperty,
  PropertyDefinition,
} from "app/main/content/_model/meta/property";
import { ClassPropertyService } from "app/main/content/_service/meta/core/property/class-property.service";
import { DerivationRuleValidators } from "app/main/content/_validator/derivation-rule.validators";
import { GlobalInfo } from "app/main/content/_model/global-info";
import { Tenant } from "app/main/content/_model/tenant";

@Component({
  selector: "attribute-rule-precondition",
  templateUrl: "./attribute-rule-configurator-precondition.component.html",
  styleUrls: ["../rule-configurator.component.scss"],
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective },
  ],
})
export class FuseAttributeRulePreconditionConfiguratorComponent
  implements OnInit {
  @Input("attributeCondition")
  attributeCondition: AttributeCondition;
  @Output("attributeConditionChange")
  attributeConditionChange: EventEmitter<AttributeCondition> = new EventEmitter<
    AttributeCondition
  >();

  tenantAdmin: User;
  marketplace: Marketplace;
  role: UserRole;
  tenant: Tenant;
  rulePreconditionForm: FormGroup;
  classDefinitions: ClassDefinition[] = [];
  classProperties: ClassProperty<any>[] = [];
  comparisonOperators: any;

  enumValues = [];

  propertyDefinition: PropertyDefinition<any>;

  classDefinitionCache: ClassDefinition[] = [];
  attributeForms: FormArray;

  attributeValidationMessages = DerivationRuleValidators.ruleValidationMessages;

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private classDefinitionService: ClassDefinitionService,
    private classPropertyService: ClassPropertyService,
    private parent: FormGroupDirective
  ) {
    this.rulePreconditionForm = formBuilder.group({
      classPropertyId: new FormControl(undefined, [Validators.required]),
      comparisonOperatorType: new FormControl(undefined, [Validators.required]),
      value: new FormControl(undefined, [Validators.required]),
    });
  }

  async ngOnInit() {
    this.rulePreconditionForm.setValue({
      classPropertyId:
        (this.attributeCondition.classProperty
          ? this.attributeCondition.classProperty.id
          : "") || "",
      comparisonOperatorType:
        this.attributeCondition.comparisonOperatorType || " ",
      value: this.attributeCondition.value || "",
    });
    this.attributeForms = <FormArray>(
      this.parent.form.controls["classAttributeForms"]
    );
    this.attributeForms.push(this.rulePreconditionForm);

    this.comparisonOperators = Object.keys(ComparisonOperatorType);

    const globalInfo = <GlobalInfo>(
      await this.loginService.getGlobalInfo().toPromise()
    );
    this.marketplace = globalInfo.marketplace;
    this.tenantAdmin = globalInfo.user;
    this.tenant = globalInfo.tenants[0];

    this.classDefinitionService
      .getAllClassDefinitionsWithoutHeadAndEnums(
        this.marketplace,
        this.tenant.id
      )
      .toPromise()
      .then((definitions: ClassDefinition[]) => {
        this.classDefinitions = definitions;
        this.loadClassProperties(null);
      });
  }

  onPropertyChange(classProperty: ClassProperty<any>, $event) {
    if (
      $event.isUserInput &&
      (!this.attributeCondition.classProperty ||
        this.attributeCondition.classProperty.id != classProperty.id)
    ) {
      this.initAttributeCondition();
      this.attributeCondition.classProperty = classProperty;
      this.attributeConditionChange.emit(this.attributeCondition);
    }
    // this.attributeCondition.classProperty.id = $event.source.value;
    // this.rulePreconditionForm.value.classPropertyId = $event.source.value;
  }

  private initAttributeCondition() {
    this.attributeCondition.classProperty = new ClassProperty();
    this.attributeCondition.comparisonOperatorType = ComparisonOperatorType.EQ;
    this.attributeCondition.value = undefined;
    this.rulePreconditionForm.reset();
  }

  private loadClassProperties($event) {
    if (this.attributeCondition && this.attributeCondition.classDefinition) {
      this.classPropertyService
        .getAllClassPropertiesFromClass(
          this.marketplace,
          this.attributeCondition.classDefinition.id
        )
        .toPromise()
        .then((props: ClassProperty<any>[]) => {
          this.classProperties = props;
          this.enumValues = [];
          this.onChange($event);
        });
    }
  }

  findEnumValues() {
    if (
      this.attributeCondition.classProperty.type === "ENUM" &&
      this.enumValues.length == 0
    ) {
      this.classDefinitionService
        .getEnumValuesFromEnumHeadClassDefinition(
          this.marketplace,
          this.attributeCondition.classProperty.allowedValues[0].enumClassId,
          this.tenant.id
        )
        .toPromise()
        .then((list: any[]) => {
          this.enumValues = list.map((e) => e.value);
        });
    }
    return this.enumValues;
  }

  onOperatorChange(op, $event) {
    if ($event.isUserInput) {
      // ignore on deselection of the previous option
      this.attributeCondition.comparisonOperatorType = op;
    }
  }

  onChange($event) {
    if (this.classProperties.length > 0) {
      this.attributeCondition.classProperty =
        this.classProperties.find(
          (cp) => cp.id === this.rulePreconditionForm.value.classPropertyId
        ) || new ClassProperty();
      this.attributeCondition.comparisonOperatorType = this.rulePreconditionForm.value.comparisonOperatorType;
      this.attributeCondition.value = this.rulePreconditionForm.value.value;
      this.attributeConditionChange.emit(this.attributeCondition);
    }
  }

  private retrieveComparisonOperatorValueOf(op) {
    let x: ComparisonOperatorType =
      ComparisonOperatorType[op as keyof typeof ComparisonOperatorType];
    return x;
  }
}
