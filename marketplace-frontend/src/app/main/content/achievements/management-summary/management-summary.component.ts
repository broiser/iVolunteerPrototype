import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../_service/login.service';
import { ClassInstanceService } from '../../_service/meta/core/class/class-instance.service';
import { CoreMarketplaceService } from '../../_service/core-marketplace.service';
import { ActivatedRoute } from '@angular/router';
import { CoreVolunteerService } from '../../_service/core-volunteer.service';
import { StoredChartService } from '../../_service/stored-chart.service';
import { Volunteer } from '../../_model/volunteer';
import { Participant } from '../../_model/participant';
import { CIP } from '../../_model/classInstancePropertyConstants';
import { isNullOrUndefined } from 'util';
import { ClassInstance } from '../../_model/meta/Class';


@Component({
  selector: 'fuse-management-summary',
  templateUrl: './management-summary.component.html',
  styleUrls: ['./management-summary.component.scss']
})
export class ManagementSummaryComponent implements OnInit {
  IVOLUNTEER_UUID = CIP.IVOLUNTEER_UUID;
  IVOLUNTEER_SOURCE = CIP.IVOLUNTEER_SOURCE;
  TASK_ID = CIP.TASK_ID;
  TASK_NAME = CIP.TASK_NAME;
  TASK_TYPE_1 = CIP.TASK_TYPE_1;
  TASK_TYPE_2 = CIP.TASK_TYPE_2;
  TASK_TYPE_3 = CIP.TASK_TYPE_3;
  TASK_TYPE_4 = CIP.TASK_TYPE_4;
  TASK_DESCRIPTION = CIP.TASK_DESCRIPTION;
  ZWECK = CIP.ZWECK;
  ROLLE = CIP.ROLLE;
  RANG = CIP.RANG;
  PHASE = CIP.PHASE;
  ARBEITSTEILUNG = CIP.ARBEITSTEILUNG;
  EBENE = CIP.EBENE;
  TASK_DATE_FROM = CIP.TASK_DATE_FROM;
  TASK_DATE_TO = CIP.TASK_DATE_TO;
  TASK_DURATION = CIP.TASK_DURATION;
  TASK_LOCATION = CIP.TASK_LOCATION;
  TASK_GEO_INFORMATION = CIP.TASK_GEO_INFORMATION;

  // comparison chart
  comparisonXlabel = 'Jahr';
  comparisonYlabel = 'Anzahl Tätigkeiten';
  colorScheme = 'cool';
  schemeType = 'ordinal';
  showGridLines = true;
  animations = true;
  gradient = false;
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisLabel = 'Datum';
  yAxisLabel = 'Dauer [h]';
  noBarWhenZero = true;
  showLabels = true;
  autoScale = true;
  legend = false;
  legendPosition = 'below';
  tooltipDisabled = false;

  private comparisonData: any[] = [];
  comparisonYear: string;
  volunteer: any;
  marketplace: any;
  classInstances: any[];
  filteredClassInstances: any[];
  yearsMap: any;

  fakeDataMap: any;
  fakeData = [
    {
      "name": "2012",
      "value": 0,
    },
    {
      "name": "2013",
      "value": 0,
    },
    {
      "name": "2014",
      "value": 0,
    },
    {
      "name": "2015",
      "value": 13,
    },
    {
      "name": "2016",
      "value": 22,
    },
    {
      "name": "2017",
      "value": 19,
    },
    {
      "name": "2018",
      "value": 34,
    },
    {
      "name": "2019",
      "value": 28,
    },
  ];
  uniqueYears: any[];



  constructor(
    private loginService: LoginService,
    private classInstanceService: ClassInstanceService,
    private marketplaceService: CoreMarketplaceService,
    private route: ActivatedRoute,
    private volunteerService: CoreVolunteerService,
    private storedChartService: StoredChartService
  ) { }

  ngOnInit() {
    this.comparisonYear = '2015';

    this.loginService.getLoggedIn().toPromise().then((participant: Participant) => {
      this.volunteer = participant as Volunteer;

      Promise.all([
        this.marketplaceService.findAll().toPromise(),
        this.volunteerService.findRegisteredMarketplaces(this.volunteer.id).toPromise()
      ]).then((values: any[]) => {

        // TODO: 
        this.marketplace = values[0][0];

        this.classInstanceService.getUserClassInstancesByArcheType(this.marketplace, 'TASK').toPromise().then((ret: ClassInstance[]) => {
          if (!isNullOrUndefined(ret)) {
            this.classInstances = ret;

            this.classInstances.forEach((ci, index, object) => {
              if (ci.properties[this.TASK_DURATION].values[0] == 'null') {
                object.splice(index, 1);
              }
            });

            this.filteredClassInstances = [...this.classInstances];
            this.generateStaticChartData();

          }
        });
      });
    });

  }

  onComparisonYearChanged(value) {
    this.comparisonYear = value;

    let comparisonYearDataFeuerwehr = this.yearsMap.get(this.comparisonYear);
    let comparisonYearDataMusikverein = this.fakeData.find(d => {
      return d.name === this.comparisonYear;
    }).value;
    let data = [];
    let dataFinal = [];

    this.uniqueYears.forEach(curYear => {
      let currentYearDataFeuerwehr = this.yearsMap.get(curYear);
      let currentYearDataMusikverein = this.fakeData.find(d => {
        return d.name === curYear;
      }).value;

      data = [];
      data.push({ name: 'Feuerwehr', value: currentYearDataFeuerwehr - comparisonYearDataFeuerwehr });
      data.push({ name: 'Musikverein', value: currentYearDataMusikverein - comparisonYearDataMusikverein });
      dataFinal.push({ name: curYear, series: data });
    });

    this.comparisonData = [...dataFinal];

  }

  generateStaticChartData() {
    // yearComparison
    let yearsList = this.classInstances.map(ci => {
      return ({ year: (new Date(ci.properties[this.TASK_DATE_FROM].values[0]).getFullYear()).toString(), value: 1 });
    });

    this.yearsMap = new Map<string, number>();
    yearsList.forEach(t => {
      if (this.yearsMap.get(t.year)) {
        this.yearsMap.set(t.year, Number(this.yearsMap.get(t.year)) + Number(t.value))
      } else {
        this.yearsMap.set(t.year, t.value);
      }
    });

    let comparisonYearDataFeuerwehr = this.yearsMap.get(this.comparisonYear);
    let comparisonYearDataMusikverein = this.fakeData.find(d => {
      return d.name === this.comparisonYear;
    }).value;
    let data = [];
    let dataFinal = [];

    this.uniqueYears = [...new Set(yearsList.map(item => item.year))];
    this.uniqueYears.forEach(curYear => {

      let currentYearDataFeuerwehr = this.yearsMap.get(curYear);
      let currentYearDataMusikverein = this.fakeData.find(d => {
        return d.name === curYear;
      }).value;

      data = [];
      data.push({ name: 'Feuerwehr', value: currentYearDataFeuerwehr - comparisonYearDataFeuerwehr });
      data.push({ name: 'Musikverein', value: currentYearDataMusikverein - comparisonYearDataMusikverein });
      dataFinal.push({ name: curYear, series: data });
    });

    this.comparisonData = [...dataFinal];
    // /yearComparision

  }

}