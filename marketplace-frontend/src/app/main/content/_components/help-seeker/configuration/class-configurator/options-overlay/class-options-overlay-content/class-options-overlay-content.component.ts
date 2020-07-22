import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { ClassDefinition } from "app/main/content/_model/meta/class";
import {
  Relationship,
  RelationshipType,
} from "app/main/content/_model/meta/relationship";
import { Marketplace } from "app/main/content/_model/marketplace";
import { CConstants } from "../../utils-and-constants";
import { PropertyType } from "app/main/content/_model/meta/property";
import { DomSanitizer } from "@angular/platform-browser";
import { AddPropertyDialogData } from "app/main/content/_components/_shared/dialogs/add-property-dialog/add-property-dialog.component";
import { isNullOrUndefined } from "util";
import { RemoveDialogData } from "app/main/content/_components/_shared/dialogs/remove-dialog/remove-dialog.component";
import { DialogFactoryDirective } from "app/main/content/_components/_shared/dialogs/_dialog-factory/dialog-factory.component";
import { User } from "app/main/content/_model/user";
import { OptionsOverlayContentData } from '../options-overlay-control/options-overlay-control.component';


export interface PropertyOrEnumEntry {
  name: string;
  type: PropertyType;
}

@Component({
  selector: "class-options-overlay-content",
  templateUrl: "./class-options-overlay-content.component.html",
  styleUrls: ["./class-options-overlay-content.component.scss"],
})
export class ClassOptionsOverlayContentComponent implements OnInit {
  @Input() inputData: OptionsOverlayContentData;
  @Output() resultData = new EventEmitter<OptionsOverlayContentData>();

  relationshipPalettes = CConstants.relationshipPalettes;
  propertyTypePalettes = CConstants.propertyTypePalettes;

  entryList: PropertyOrEnumEntry[];

  constructor(
    private dialogFactory: DialogFactoryDirective,
    private _sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.updatePropertiesAndEnumsList();
  }

  onSubmit() {
    this.resultData.emit(this.inputData);
  }

  onCancel() {
    this.resultData.emit(undefined);
  }

  changeIconClicked() {
    this.dialogFactory
      .openChangeIconDialog(
        this.inputData.marketplace,
        this.inputData.classDefinition.imagePath
      )
      .then((result: any) => {
        this.inputData.classDefinition.imagePath = result;
      });
  }

  getImagePathForRelationship(relationshipType: RelationshipType) {
    return this.relationshipPalettes.rows.find((r) => r.id === relationshipType)
      .imgPath;
  }

  getLabelForRelationship(relationshipType: RelationshipType) {
    return RelationshipType.getLabelFromRelationshipType(relationshipType);
  }

  getImagePathPropertyType(propertyType: PropertyType) {
    return this.propertyTypePalettes.find((p) => p.id === propertyType).imgPath;
  }

  getEntryStyle(index: number) {
    if (index < this.entryList.length - 1) {
      return this._sanitizer.bypassSecurityTrustStyle(
        "height: 20px; border-bottom: solid 1px rgb(80, 80, 80)"
      );
    } else {
      return this._sanitizer.bypassSecurityTrustStyle(
        "height: 20px; border-bottom: none"
      );
    }
  }

  addPropertyClicked() {
    this.dialogFactory
      .openAddPropertyDialog(
        this.inputData.marketplace,
        this.inputData.helpseeker,
        this.inputData.classDefinition,
        this.inputData.allClassDefinitions,
        this.inputData.allRelationships
      )
      .then((ret: AddPropertyDialogData) => {
        if (!isNullOrUndefined(ret)) {
          this.inputData.classDefinition.properties =
            ret.classDefinition.properties;
          this.updatePropertiesAndEnumsList();
        }
      });
  }

  removeClicked() {
    this.dialogFactory
      .openRemoveDialog(
        this.inputData.marketplace,
        this.inputData.classDefinition
      )
      .then((ret: RemoveDialogData) => {
        if (!isNullOrUndefined(ret)) {
          this.inputData.classDefinition.properties =
            ret.classDefinition.properties;
          this.updatePropertiesAndEnumsList();
        }
      });
  }

  previewClicked() {
    this.dialogFactory
      .openInstanceFormPreviewDialog(
        this.inputData.marketplace,
        this.inputData.allClassDefinitions,
        this.inputData.allRelationships,
        this.inputData.classDefinition
      )
      .then(() => { });
  }

  updatePropertiesAndEnumsList() {
    this.entryList = [];
    this.entryList.push(...this.inputData.classDefinition.properties);
    // this.entryList.push(...this.inputData.classDefinition.enums.map(e => ({ name: e.name, type: PropertyType.ENUM })));
  }
}
