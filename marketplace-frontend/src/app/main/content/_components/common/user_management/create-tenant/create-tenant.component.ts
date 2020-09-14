import { Component, OnInit } from "@angular/core";
import { LoginService } from 'app/main/content/_service/login.service';
import { GlobalInfo } from 'app/main/content/_model/global-info';
import { Tenant } from 'app/main/content/_model/tenant';
import { FuseConfigService } from '@fuse/services/config.service';

const STANDARD_PRIMARY_COLOR = '#3e7ddb';
const STANDARD_SECONDARY_COLOR = '#fafafa';


@Component({
  selector: "create-tenant",
  templateUrl: "create-tenant.component.html",
  styleUrls: ["create-tenant.component.scss"],
})
export class CreateTenantComponent implements OnInit {

  globalInfo: GlobalInfo;
  tenant: Tenant;
  loaded: boolean;

  constructor(
    private fuseConfig: FuseConfigService,
    private loginService: LoginService,
  ) { }

  ngOnInit() {
    this.loaded = false;

    const layout = {
      navigation: 'none',
      footer: 'none',
    };

    this.fuseConfig.setConfig({ layout: layout });

    this.loginService.getGlobalInfo().toPromise().then((globalInfo: GlobalInfo) => {
      this.globalInfo = globalInfo;
      this.tenant = new Tenant({ name: this.globalInfo.user.organizationName, primaryColor: STANDARD_PRIMARY_COLOR, secondaryColor: STANDARD_SECONDARY_COLOR });
      this.loaded = true;
    });
  }

}