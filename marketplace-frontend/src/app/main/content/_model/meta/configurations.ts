import { MatchingOperatorRelationship, MatchingCollector } from '../matching';

export class ClassConfiguration {
    id: string;
    name: string;
    description: string;
    classDefinitionIds: string[];
    relationshipIds: string[];
    timestamp: Date;
    userId: string;
    tenantId: string

}

export class MatchingConfiguration {
    id: string;
    name: string;
    timestamp: Date;

    producerClassConfigurationId: string;
    consumerClassConfigurationId: string;

    producerClassConfigurationName: string;
    consumerClassConfigurationName: string;

    relationships: MatchingOperatorRelationship[];
}

export class MatchingCollectorConfiguration {
    id: string;
    classConfigurationId: string;

    collectors: MatchingCollector[];
}

