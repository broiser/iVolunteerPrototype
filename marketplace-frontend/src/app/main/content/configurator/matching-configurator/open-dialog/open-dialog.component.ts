import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Marketplace } from 'app/main/content/_model/marketplace';
import { LoginService } from 'app/main/content/_service/login.service';
import { Helpseeker } from 'app/main/content/_model/helpseeker';
import { MatchingConfigurationService } from 'app/main/content/_service/configuration/matching-configuration.service';
import { MatchingConfiguration } from 'app/main/content/_model/configurations';
import { MatchingBrowseSubDialogData } from 'app/main/content/configurator/matching-configurator/browse-sub-dialog/browse-sub-dialog.component';

export interface OpenMatchingDialogData {
  marketplace: Marketplace;
  matchingConfiguration: MatchingConfiguration;
}

@Component({
  selector: 'open-matching-dialog',
  templateUrl: './open-dialog.component.html',
  styleUrls: ['./open-dialog.component.scss'],
})
export class OpenMatchingDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<OpenMatchingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OpenMatchingDialogData,
    private matchingConfigurationService: MatchingConfigurationService,
    private loginService: LoginService
  ) {
  }

  allMatchingConfigurations: MatchingConfiguration[];
  browseDialogData: MatchingBrowseSubDialogData;

  recentMatchingConfigurations: MatchingConfiguration[];
  loaded: boolean;
  browseMode: boolean;

  ngOnInit() {
    this.loginService.getLoggedIn().toPromise().then((helpseeker: Helpseeker) => {
      this.matchingConfigurationService.getAllMatchingConfigurations(this.data.marketplace)
        .toPromise()
        .then((matchingConfigurations: MatchingConfiguration[]) => {
          this.recentMatchingConfigurations = matchingConfigurations;
          this.allMatchingConfigurations = matchingConfigurations;


          //----DEBUG
          // this.recentMatchingConfigurations.push(...this.recentMatchingConfigurations);
          // this.recentMatchingConfigurations.push(...this.recentMatchingConfigurations);
          //----
          this.recentMatchingConfigurations = this.recentMatchingConfigurations.sort((a, b) => b.timestamp.valueOf() - a.timestamp.valueOf());

          if (this.recentMatchingConfigurations.length > 5) {
            this.recentMatchingConfigurations = this.recentMatchingConfigurations.slice(0, 5);
          }
          this.loaded = true;
        });

    });
  }

  itemSelected(event: any, matchingConfiguration: MatchingConfiguration) {
    this.data.matchingConfiguration = matchingConfiguration;
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  handleBrowseClick() {
    this.browseDialogData = new MatchingBrowseSubDialogData();

    this.browseDialogData.title = 'Durchsuchen';
    this.browseDialogData.entries = [];
    this.browseDialogData.marketplace = this.data.marketplace;

    for (const matchingConfiguration of this.allMatchingConfigurations) {
      this.browseDialogData.entries.push({
        id: matchingConfiguration.id,
        name: matchingConfiguration.name,
        producer: matchingConfiguration.producerClassConfigurationName,
        consumer: matchingConfiguration.consumerClassConfigurationName,
        date: matchingConfiguration.timestamp
      });
    }

    this.browseMode = true;

  }

  handleReturnFromBrowse(event: { cancelled: boolean, entryId: string }) {
    this.browseMode = false;

    if (!event.cancelled) {
      this.data.matchingConfiguration = this.allMatchingConfigurations.find(c => c.id === event.entryId);
      this.dialogRef.close(this.data);
    }
  }







}

