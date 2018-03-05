import {Injectable} from '@angular/core';
import {Task} from '../task/task';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class TaskInteractionService {

  private apiUrl = '/rest';

  constructor(private http: HttpClient) {
  }

  findById(task: Task) {
    return this.http.get([this.apiUrl, 'task', task.id, 'interaction'].join('/'));
  }

  reserve(task: Task) {
    return this.http.post([this.apiUrl, 'volunteer/reserve'].join('/'), task.id);
  }
}
