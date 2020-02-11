import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Marketplace } from '../../../_model/marketplace';
import { ClassDefinitionService } from '../../../_service/meta/core/class/class-definition.service';
import { ClassInstance } from '../../../_model/meta/Class';
import { CoreMarketplaceService } from 'app/main/content/_service/core-marketplace.service';
import { QuestionService } from 'app/main/content/_service/question.service';
import { FormConfiguration, FormEntryReturnEventData } from 'app/main/content/_model/meta/form';
import { QuestionControlService } from 'app/main/content/_service/question-control.service';
import { PropertyInstance } from 'app/main/content/_model/meta/Property';
import { ClassInstanceService } from 'app/main/content/_service/meta/core/class/class-instance.service';
import { isNullOrUndefined } from 'util';
import { Volunteer } from 'app/main/content/_model/volunteer';
import { CoreVolunteerService } from 'app/main/content/_service/core-volunteer.service';
import { LoginService } from 'app/main/content/_service/login.service';
import { Participant } from 'app/main/content/_model/participant';

@Component({
  selector: 'app-class-instance-form-editor',
  templateUrl: './class-instance-form-editor.component.html',
  styleUrls: ['./class-instance-form-editor.component.scss'],
  providers: [QuestionService, QuestionControlService]
})
export class ClassInstanceFormEditorComponent implements OnInit {

  marketplace: Marketplace;

  formConfigurations: FormConfiguration[];
  currentFormConfiguration: FormConfiguration;

  returnedClassInstances: ClassInstance[];


  canContinue: boolean;
  canFinish: boolean;
  lastEntry: boolean;

  isLoaded = false;


  formConfigurationType: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private marketplaceService: CoreMarketplaceService,
    private classDefinitionService: ClassDefinitionService,
    private classInstanceService: ClassInstanceService,
    private questionService: QuestionService,
    private questionControlService: QuestionControlService
  ) {
    // console.log('extras');
    // console.log(this.router.getCurrentNavigation().extras.state);
  }

  ngOnInit() {
    let marketplaceId: string;
    const childClassIds: string[] = [];

    this.returnedClassInstances = [];


    Promise.all([
      this.route.params.subscribe(params => {
        marketplaceId = params['marketplaceId'];
        this.formConfigurationType = params['type'];
      }),
      this.route.queryParams.subscribe(queryParams => {
        let i = 0;
        while (!isNullOrUndefined(queryParams[i])) {
          childClassIds.push(queryParams[i]);
          i++;
        }
      })
    ]).then(() => {
      this.marketplaceService.findById(marketplaceId).toPromise().then((marketplace: Marketplace) => {
        this.marketplace = marketplace;

        if (isNullOrUndefined(this.formConfigurationType)) {
          this.formConfigurationType = 'top-down';
        }

        this.classDefinitionService.getFormConfigurations(this.marketplace, childClassIds, this.formConfigurationType).toPromise()
          .then((formConfigurations: FormConfiguration[]) => {

            this.formConfigurations = formConfigurations;

            console.log(formConfigurations);

          //   for (const config of this.formConfigurations) {
          //     config.formEntry.questions = this.questionService.getQuestionsFromProperties(config.formEntry.classProperties);
          //     config.formEntry.formGroup = this.questionControlService.toFormGroup(config.formEntry.questions);
          //   }
          // })

          // .then(() => {
          //   this.currentFormConfiguration = this.formConfigurations.pop();

          //   if (this.formConfigurations.length === 0) {
          //     this.lastEntry = true;
          //   }

          //   console.log(this.currentFormConfiguration);
          //   this.isLoaded = true;
          });


      });
    });
  }

  handleResultEvent(event: FormEntryReturnEventData) {
    const classInstances: ClassInstance[] = [];
    this.currentFormConfiguration.formEntry.formGroup.disable();
    const propertyInstances: PropertyInstance<any>[] = [];

    for (const classProperty of this.currentFormConfiguration.formEntry.classProperties) {
      const values = [event.formGroup.value[classProperty.id]];
      propertyInstances.push(new PropertyInstance(classProperty, values));
    }

    for (const enumRepresentation of this.currentFormConfiguration.formEntry.enumRepresentations) {
      const values = [event.formGroup.value[enumRepresentation.classDefinition.id]];
      const propertyInstance = new PropertyInstance(enumRepresentation.classDefinition.properties[0], values);
      propertyInstance.name = enumRepresentation.classDefinition.name;
      propertyInstance.id = enumRepresentation.id;
      propertyInstances.push(propertyInstance);
    }

    const classInstance: ClassInstance = new ClassInstance(this.currentFormConfiguration.formEntry.classDefinitions[0], propertyInstances);
    classInstance.imagePath = this.currentFormConfiguration.formEntry.imagePath;
    classInstances.push(classInstance);

    this.classInstanceService.createNewClassInstances(this.marketplace, classInstances).toPromise().then((ret: ClassInstance[]) => {
      // handle returned value if necessary
      if (!isNullOrUndefined(ret)) {
        this.returnedClassInstances.push(...ret);
        this.handleNextClick();
      }
    });
  }

  handleNextClick() {
    this.canContinue = false;
    if (this.formConfigurations.length > 0) {
      this.currentFormConfiguration = this.formConfigurations.pop();
      if (this.formConfigurations.length === 0) {
        this.lastEntry = true;
      }
    } else {
      this.handleFinishClick();
    }
  }

  handleFinishClick() {
    this.router.navigate(['/main/helpseeker/asset-inbox']);
  }

  handleCancelEvent() {
    this.navigateBack();
  }

  printAnything(anything: any) {
    console.log(anything);
  }


  navigateBack() {
    window.history.back();
  }

}
