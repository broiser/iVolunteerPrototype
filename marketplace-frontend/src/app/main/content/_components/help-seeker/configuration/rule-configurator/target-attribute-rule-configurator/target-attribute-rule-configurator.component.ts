import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
import { LoginService } from "../../../../../_service/login.service";
import { FormGroup, FormBuilder, FormControl, ControlContainer, FormGroupDirective, Validators, FormArray } from "@angular/forms";
import { Marketplace } from "app/main/content/_model/marketplace";
import { AttributeCondition } from "app/main/content/_model/derivation-rule";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import { ClassDefinitionService } from "app/main/content/_service/meta/core/class/class-definition.service";
import {
  ClassProperty,
  PropertyDefinition,
} from "app/main/content/_model/meta/property";
import { ClassPropertyService } from "app/main/content/_service/meta/core/property/class-property.service";
import { User, UserRole } from "app/main/content/_model/user";
import { DerivationRuleValidators } from 'app/main/content/_validator/derivation-rule.validators';
import { GlobalInfo } from "app/main/content/_model/global-info";
import { QuestionBase, SingleSelectionEnumQuestion } from 'app/main/content/_model/dynamic-forms/questions';
import { QuestionService } from 'app/main/content/_service/question.service';
import { QuestionControlService } from 'app/main/content/_service/question-control.service';
import { isNullOrUndefined } from 'util';
import { FormEntry } from 'app/main/content/_model/meta/form';

@Component({
  selector: "target-attribute-rule-configurator",
  templateUrl: "./target-attribute-rule-configurator.component.html",
  styleUrls: ["./target-attribute-rule-configurator.component.scss"],
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupDirective }],
  providers: [QuestionService, QuestionControlService]
})
export class TargetAttributeRuleConfiguratorComponent implements OnInit {
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
  ruleQuestionForm: FormGroup;
  questions: QuestionBase<any>[] = [];
  question: QuestionBase<any>;
  classProperties: ClassProperty<any>[] = [];

  attributeForms: FormArray;

  propertyDefinition: PropertyDefinition<any>;

  classDefinitionCache: ClassDefinition[] = [];

  targetValidationMessages = DerivationRuleValidators.ruleValidationMessages;

  constructor(
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private classDefinitionService: ClassDefinitionService,
    private classPropertyService: ClassPropertyService,
    private questionService: QuestionService,
    private questionControlService: QuestionControlService,
    private parent: FormGroupDirective
  ) {
  }

  async ngOnInit() {
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

    const globalInfo = <GlobalInfo>(
      await this.loginService.getGlobalInfo().toPromise()
    );
    this.marketplace = globalInfo.marketplace;
    this.helpseeker = globalInfo.user;

    this.loadClassProperties(null);
    if (!isNullOrUndefined(this.attributeTarget.classProperty)){
      this.addQuestionAndFormGroup(this.attributeTarget.classProperty);
    }
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
        });
    }
  }

  private addQuestionAndFormGroup(classProperty: ClassProperty<any>){
    let myArr: ClassProperty<any>[] = new Array();
    myArr.push(classProperty);
    this.questions = this.questionService.getQuestionsFromProperties(myArr);
    this.question = this.questions[0] as SingleSelectionEnumQuestion;
    
    // set question value in case of existing rule
    if (this.attributeTarget.value){
        this.question.value = this.attributeTarget.value;
    }
     
    this.ruleQuestionForm = this.questionControlService.toFormGroup(this.questions);
    this.ruleTargetAttributeForm.addControl('questionForm', this.ruleQuestionForm);

    // detect change in question form
    this.ruleTargetAttributeForm.get('questionForm').valueChanges.subscribe((change) => {
      this.ruleTargetAttributeForm.patchValue({
          value: this.ruleTargetAttributeForm.get('questionForm').get(this.question.key).value});
       
      this.attributeTarget.value = this.ruleTargetAttributeForm.get('questionForm').get(this.question.key).value;
    });
  }

  private initAttributeTarget() {
    this.attributeTarget.classProperty = new ClassProperty();
    this.attributeTarget.value = "";
    this.ruleTargetAttributeForm.reset();
  }

  onPropertyChange(classProperty: ClassProperty<any>, $event) {
    if (
      $event.isUserInput &&
      (!this.attributeTarget.classProperty ||
        this.attributeTarget.classProperty.id != classProperty.id)
    ) {
      this.initAttributeTarget();
      this.attributeTarget.classProperty = classProperty;
      // create new form for value
      this.addQuestionAndFormGroup(classProperty);
      
      this.attributeTargetChange.emit(this.attributeTarget);
    }
  }


  onChange($event) {
    if (this.classProperties.length > 0) {
      this.attributeTarget.classProperty =
        this.classProperties.find(
          (cp) => cp.id === this.ruleTargetAttributeForm.value.classPropertyId
        ) || new ClassProperty();
      this.addQuestionAndFormGroup(this.attributeTarget.classProperty);
      this.attributeTargetChange.emit(this.attributeTarget);
    }
  }

  onChangeValue($event) {
    if (this.classProperties.length > 0) {
      this.attributeTarget.classProperty =
        this.classProperties.find(
          (cp) => cp.id === this.ruleTargetAttributeForm.value.classPropertyId
        ) || new ClassProperty();
        this.addQuestionAndFormGroup(this.attributeTarget.classProperty);
      this.attributeTarget.value = this.ruleTargetAttributeForm.value.value;
      this.attributeTargetChange.emit(this.attributeTarget);
    }
  }
}
