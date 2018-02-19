import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {isNullOrUndefined} from 'util';
import {TaskType} from './task-type';

@Injectable()
export class TaskTypeService {

  private apiUrl = '/rest/taskType';

  constructor(private http: HttpClient) {
  }

  findAll() {
    return this.http.get(this.apiUrl);
  }

  findById(id: string) {
    return this.http.get([this.apiUrl, id].join('/'));
  }

  save(taskType: TaskType) {
    if (isNullOrUndefined(taskType.id)) {
      return this.http.post(this.apiUrl, taskType);
    }
    return this.http.put([this.apiUrl, taskType.id].join('/'), taskType);
  }

  remove(taskType: TaskType) {
    return this.http.delete([this.apiUrl, taskType.id].join('/'));
  }
}