import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {Task} from '../../../_model/task';
import {TaskInteraction} from '../../../_model/task-interaction';

import {TaskService} from '../../../_service/task.service';
import {TaskInteractionService} from '../../../_service/task-interaction.service';
import {DatePipe} from '@angular/common';
import {isNullOrUndefined} from 'util';
import {CoreMarketplaceService} from '../../../_service/core-marketplace.service';
import {Marketplace} from '../../../_model/marketplace';

@Component({
  selector: 'fuse-task-timeline',
  templateUrl: './task-timeline.component.html',
  styleUrls: ['./task-timeline.component.scss'],
  providers: [DatePipe]
})
export class FuseTaskTimelineComponent implements OnInit {

  public days = new Set<string>();
  private date2Interactions = new Map<string, TaskInteraction[]>();

  constructor(private route: ActivatedRoute,
              private datePipe: DatePipe,
              private marketplaceService: CoreMarketplaceService,
              private taskService: TaskService,
              private taskInteractionService: TaskInteractionService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => this.loadTaskInteractions(params['marketplaceId'], params['taskId']));
  }

  private loadTaskInteractions(marketplaceId: string, taskId: string) {
    this.marketplaceService.findById(marketplaceId).toPromise().then((marketplace: Marketplace) => {
      this.taskService.findById(marketplace, taskId).toPromise().then((task: Task) => {
        this.taskInteractionService.findByTask(marketplace, task).toPromise().then((taskInteractions: TaskInteraction[]) => {
          taskInteractions.forEach((taskInteraction: TaskInteraction) => {
            const day = this.datePipe.transform(taskInteraction.timestamp, 'dd.MM.yyyy');
            if (!this.date2Interactions.has(day)) {
              this.days.add(day);
              this.date2Interactions.set(day, new Array<TaskInteraction>());
            }
            this.date2Interactions.get(day).push(taskInteraction);
          });
        });
      });
    });
  }


  getTaskInteractionsByDay(dayAsString: string) {
    return isNullOrUndefined(this.date2Interactions) ? [] : this.date2Interactions.get(dayAsString);
  }
}
