import {Competence} from './competence';

export class Task {
  id: string;
  name: string;
  description: string;
  workflowKey: string;
  marketplaceId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  requiredCompetences: Competence[];
  acquirableCompetences: Competence[];
}