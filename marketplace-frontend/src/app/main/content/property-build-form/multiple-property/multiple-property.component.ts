import { Component, OnInit, Input } from '@angular/core';
import { PropertyListItem, Property, PropertyKind, MultiplePropertyRet } from '../../_model/properties/Property';
import { MatTableDataSource } from '@angular/material';
import { PropertyService } from '../../_service/property.service';
import { Marketplace } from '../../_model/marketplace';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { propertyNameUniqueValidator } from '../../_validator/property-name-unique.validator';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-multiple-property',
  templateUrl: './multiple-property.component.html',
  styleUrls: ['./multiple-property.component.scss']
})
export class MultiplePropertyComponent implements OnInit {

  @Input() propertyListItems: PropertyListItem[];
  @Input() marketplace : Marketplace;
  @Input() currentProperty: Property<any>;

  //Controls
  showAddPropertyList: boolean;
  submitPressed: boolean;

  propertyKindOptions: string[] = [];

  //MultiProperty
  addedProperties: PropertyListItem[] = [];

  form: FormGroup;

  property: MultiplePropertyRet = new MultiplePropertyRet();

  constructor(private propertyService: PropertyService,
    private formBuilder: FormBuilder) { }

  dataSource = new MatTableDataSource<PropertyListItem>();
  addedDataSource = new MatTableDataSource<PropertyListItem>();
  displayedColumns: string[] = ['name', 'kind', 'actions'];

  ngOnInit() {

    for (let p of this.propertyListItems) {
      p.show = true;
    }

    this.form = this.formBuilder.group({
      'name': ['', [Validators.required, propertyNameUniqueValidator(this.propertyListItems, this.currentProperty)]]
    });

    for (let kind in PropertyKind) {
      this.propertyKindOptions.push(kind);
    }

    if (!isNullOrUndefined(this.currentProperty)) {
      this.form.get('name').setValue(this.currentProperty.name);

      //Hide current Property
      this.propertyListItems.find( (item: PropertyListItem) => {
        return item.id == this.currentProperty.id;
      }).show = false;

      //Hide items already added
      for (let item of this.propertyListItems) {
        let prop = this.currentProperty.properties.find( (property: Property<any>) =>{
          return item.id == property.id;
        });

        if (!isNullOrUndefined(prop)) {

          item.show = false;
          this.addedProperties.push(item);
        }
      }

      this.addedDataSource.data = this.addedProperties;
      this.showAddPropertyList = false;

    } else {
      this.showAddPropertyList = true;
    }

    this.dataSource.data = this.propertyListItems.filter((p: PropertyListItem) => {
      // console.log(p);
      if (p.show == true) {
        return p;
      }
    });

    this.submitPressed = false;
  }

  //Add Property List
  public setShowAddPropertyList(val: boolean) { //TODO
    this.showAddPropertyList = val;
  }
  
  filterKind: string;
  filterName: string;

  public filterInput = (value: string) => {
    if (this.filterKind == undefined) {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        return data.name.toLowerCase().includes(filter) || data.kind.toString().toLowerCase().includes(filter);
      };

    } else if (value.length > 0) {    
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        return data.kind.toString().toLowerCase() == this.filterKind.toLowerCase() && 
                data.name.toLowerCase().includes(filter)
      };

    } else {
      this.dataSource.filterPredicate = (data, filter: string): boolean => {
        return data.kind.toString().toLowerCase() == this.filterKind.toLowerCase();
      };
    }

    if (!isNullOrUndefined(value) && value.length > 0) {
      this.dataSource.filter = value.trim().toLocaleLowerCase();
      this.filterName = this.dataSource.filter.trim().toLocaleLowerCase();
    } else if (!isNullOrUndefined(value) && value.length <= 0) {
      this.filterName = undefined;
    } else if (!isNullOrUndefined(this.filterKind)) {
      this.dataSource.filter = this.filterKind.trim().toLocaleLowerCase();
    }
  }


  //exclude filtering other columns
  public filterPropertyKind = (option: string) => {
    this.dataSource.filterPredicate = (data, filter: string): boolean => {
      if (!isNullOrUndefined(data.name) && !isNullOrUndefined(this.filterName)) {
        return data.kind.toString().toLocaleLowerCase() == filter && data.name.toString().toLocaleLowerCase().includes(this.filterName.toLocaleLowerCase());
      } else if (!isNullOrUndefined(data.name) && isNullOrUndefined(this.filterName)) {
        return data.kind.toString().toLocaleLowerCase() == filter;
      } else {
        return data.kind.toString().toLowerCase() == filter;
      } 
    };

    if (option == null) {
      this.dataSource.filter = '';
      this.filterKind = undefined;
      
      this.filterInput(this.filterName);
    } else {
      this.dataSource.filter = option.trim().toLowerCase();
      this.filterKind = option.trim().toLowerCase();
    }
  }

  public addProperty(prop: PropertyListItem) {
    console.log("adding property ID " + prop.id);
    console.log(prop);
    prop.show = false;
    this.addedProperties.push(prop);
    this.addedDataSource.data = this.addedProperties;
    // console.log(this.addedDataSource.data);

    this.dataSource.data = this.propertyListItems.filter((p: PropertyListItem) => {
      // console.log(p);
      if (p.show == true) {
        return p;
      }
    });
    console.log("AFTER");
    console.log(this.propertyListItems);
    
  }

  public removeProperty(prop: PropertyListItem) {
    // removing from "added Properties"
    this.addedDataSource.data = this.addedProperties.filter((p: PropertyListItem) => {
      if (p.id != prop.id) {
        return p;
      }
    });
    this.addedProperties = this.addedDataSource.data;

    //update property to be shown in list "show = true"
    for (let p of this.propertyListItems) {
      if (p.id == prop.id) {
        p.show = true;
        break;
      }
    }

    //update the datasource of the table
    this.dataSource.data = this.propertyListItems.filter((p: PropertyListItem) => {
      if (p.show) {
        return p;
      }
    });
  }

  public testRow(row: any) {
    console.log(row);
  }

  public onSubmit(valid: boolean) {
    this.submitPressed = true;

    if (this.form.valid && this.addedProperties.length > 0) {
      console.log ("Submitting");
      

      if (!isNullOrUndefined(this.currentProperty)) {
        this.property.id = this.currentProperty.id;
      }

      this.property.kind = PropertyKind.MULTIPLE;
      this.property.name = this.form.get('name').value;

      this.property.propertyIDs = [];
      this.property.rules = [];

      for (let p of this.addedProperties) {
        this.property.propertyIDs.push(p.id);
      }

      this.propertyService.addMultipleProperty(this.marketplace, this.property).toPromise().then(() => {
        console.log("done sending multiple Property");
        this.navigateBack();
      });


      console.log(JSON.stringify(this.property));

      //todo call service
    } else {
      this.form.get('name').markAsTouched();
      console.log("invalid")
    }
  }

  navigateBack() {
    window.history.back();
  }


}
