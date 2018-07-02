import { Component, ElementRef, HostBinding, Inject, OnDestroy, Renderer2, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { Subscription } from 'rxjs';

import { FuseConfigService } from '@fuse/services/config.service';

import { navigation_volunteer } from 'app/navigation/navigation_volunteer';
import { navigation_employee } from 'app/navigation/navigation_employee';
import { LoginService } from './content/_service/login.service';

@Component({
    selector     : 'fuse-main',
    templateUrl  : './main.component.html',
    styleUrls    : ['./main.component.scss'],
    providers    : [LoginService],
    encapsulation: ViewEncapsulation.None
})
export class FuseMainComponent implements OnDestroy
{
    onConfigChanged: Subscription;
    fuseSettings: any;
    navigation: any;

    @HostBinding('attr.fuse-layout-mode') layoutMode;

    constructor(
        private _renderer: Renderer2,
        private _elementRef: ElementRef,
        private fuseConfig: FuseConfigService,
        private loginService: LoginService,
        private platform: Platform,
        @Inject(DOCUMENT) private document: any
    )
    {
        this.onConfigChanged =
            this.fuseConfig.onConfigChanged
                .subscribe(
                    (newSettings) => {
                        this.fuseSettings = newSettings;
                        this.layoutMode = this.fuseSettings.layout.mode;
                    }
                );

        if ( this.platform.ANDROID || this.platform.IOS )
        {
            this.document.body.className += ' is-mobile';
        }

        this.loginService.getLoggedInParticipantRole().toPromise().then((role: string) => {
            switch(role){
                case 'EMPLOYEE':
                this.navigation = navigation_employee;
                break;
                case 'VOLUNTEER': 
                this.navigation = navigation_volunteer;
                break;
            }
        })
    }

    ngOnDestroy()
    {
        this.onConfigChanged.unsubscribe();
    }

    addClass(className: string)
    {
        this._renderer.addClass(this._elementRef.nativeElement, className);
    }

    removeClass(className: string)
    {
        this._renderer.removeClass(this._elementRef.nativeElement, className);
    }
}