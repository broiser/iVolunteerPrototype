import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { isNullOrUndefined } from "util";
import { LoginService } from "../../../../../_service/login.service";

import { MessageService } from "../../../../../_service/message.service";
import { FormGroup, FormBuilder, FormControl, ControlContainer, FormGroupDirective, Validators, FormArray } from "@angular/forms";
import { Marketplace } from "app/main/content/_model/marketplace";
import { MarketplaceService } from "app/main/content/_service/core-marketplace.service";
import { AttributeCondition } from "app/main/content/_model/derivation-rule";
import { CoreHelpSeekerService } from "app/main/content/_service/core-helpseeker.service";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import {
  ClassProperty,
  PropertyDefinition,
} from "app/main/content/_model/meta/property";
import { ClassPropertyService } from "app/main/content/_service/meta/core/property/class-property.service";
import { PropertyDefinitionService } from "../../../../../_service/meta/core/property/property-definition.service";
import { User, UserRole } from "app/main/content/_model/user";
import { DerivationRuleValidators } from 'app/main/content/_validator/derivation-rule.validators';

@Component({
  selector: "target-attribute-rule-configurator",
  templateUrl: "./target-attribute-rule-configurator.component.html",
  styleUrls: ["./target-attribute-rule-configurator.component.scss"],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }]
})
export class TargetAttributeRuleConfiguratorComponent implements OnInit {
 // @Input("parentFormArray") parentFormArray: FormArray;
  @Input("attributeTarget")
  attributeTarget: AttributeCondition;
  @Output("attributeTargetChange")
  attributeTargetChange: EventEmitter<AttributeCondition> = new EventEmitter<
    AttributeCondition
  >();

  helpseeker: User;
  marketplace: Marketplace;
  role: UserRole;
  ruleTargetAttributeForm: FormGroup;
  classProperties: ClassProperty<any>[] = [];

  attributeForms: FormArray;

  enumValues = [];

  propertyDefinition: PropertyDefinition<any>;

  classDefinitionCache: ClassDefinition[] = [];

  targetValidationMessages = DerivationRuleValidators.ruleValidationMessages;

  constructor(
    private route: ActivatedRoute,
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private classDefinitionService: ClassDefinitionService,
    private classPropertyService: ClassPropertyService,
    private propertyDefinitionService: PropertyDefinitionService,
    private helpSeekerService: CoreHelpSeekerService,
    private parent: FormGroupDirective
  ) {
  }

  ngOnInit() {
    this.attributeForms = <FormArray>this.parent.form.controls['targetAttributes'];  
    
    this.ruleTargetAttributeForm = this.formBuilder.group({
      classPropertyId: new FormControl(undefined, [Validators.required]),
      value: new FormControl(undefined, [Validators.required])
    });
    
    this.attributeForms.push(this.ruleTargetAttributeForm);
    this.ruleTargetAttributeForm.setValue({
      classPropertyId:
        (this.attributeTarget.classProperty
          ? this.attributeTarget.classProperty.id
          : "") || "",
      value: this.attributeTarget.value || "",
    });

    this.loginService
      .getLoggedIn()
      .toPromise()
      .then((helpseeker: User) => {
        this.helpseeker = helpseeker;
        this.helpSeekerService
          .findRegisteredMarketplaces(helpseeker.id)
          .toPromise()
          .then((marketplace: Marketplace) => {
            this.marketplace = marketplace;
            this.loadClassProperties(null);
          });
      });
  }

  onPropertyChange($event) {
    console.log( "attribute target --> property change");
    if (!this.attributeTarget.classProperty) {
      this.attributeTarget.classProperty = new ClassProperty();
    }
    this.attributeTarget.classProperty.id = $event.source.value;
    this.ruleTargetAttributeForm.value.classPropertyId = $event.source.value;
    this.onChange($event);
  }

  private loadClassProperties($event) {
    if (this.attributeTarget && this.attributeTarget.classDefinition) {
      this.classPropertyService
        .getAllClassPropertiesFromClass(
          this.marketplace,
          this.attributeTarget.classDefinition.id
        )
        .toPromise()
        .then((props: ClassProperty<any>[]) => {
          this.classProperties = props;
          this.enumValues = [];
          // this.onChange($event);
        });
    }
  }

  findEnumValues() {
    if (
      this.attributeTarget.classProperty.type === "ENUM" &&
      this.enumValues.length == 0
    ) {
      this.classDefinitionService
        .getEnumValuesFromEnumHeadClassDefinition(
          this.marketplace,
          this.attributeTarget.classProperty.allowedValues[0].enumClassId,
          this.helpseeker.subscribedTenants.find(
            (t) => t.role === UserRole.HELP_SEEKER
          ).tenantId
        )
        .toPromise()
        .then((list: any[]) => {
          this.enumValues = list.map((e) => e.value);
        });
    }
    return this.enumValues;
  }

  onChange($event) {
    console.log(" attribute target --> on change --> set class property definition");
    if (this.classProperties.length > 0) {
      this.attributeTarget.classProperty =
        this.classProperties.find(
          (cp) => cp.id === this.ruleTargetAttributeForm.value.classPropertyId
        ) || new ClassProperty();
      console.log(" class property: " + this.attributeTarget.classProperty);
      this.attributeTargetChange.emit(this.attributeTarget);
    }
  }

  onChangeValue($event) {
    console.log( "attribute target --> value change");
    if (this.classProperties.length > 0) {
      this.attributeTarget.classProperty =
        this.classProperties.find(
          (cp) => cp.id === this.ruleTargetAttributeForm.value.classPropertyId
        ) || new ClassProperty();
      this.attributeTarget.value = this.ruleTargetAttributeForm.value.value;
      this.attributeTargetChange.emit(this.attributeTarget);
    }
  }
}