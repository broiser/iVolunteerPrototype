import { ClassDefinition, ClassArchetype } from '../../../../_model/meta/class';
import { Relationship, RelationshipType } from '../../../../_model/meta/relationship';
import { ObjectIdService } from '../../../../_service/objectid.service.';
import { isNullOrUndefined } from 'util';
import { MatchingOperatorType } from '../../../../_model/matching';
import { PropertyType } from '../../../../_model/meta/property';


const relationshipPalettes = {
  id: 'relationships', label: 'Relationships',
  rows: [
    {
      id: RelationshipType.INHERITANCE, label: RelationshipType.getLabelFromRelationshipType(RelationshipType.INHERITANCE),
      imgPath: '/assets/icons/class_editor/relationships/inheritance.png', type: 'inheritance', shape: undefined
    },
    {
      id: RelationshipType.ASSOCIATION, label: RelationshipType.getLabelFromRelationshipType(RelationshipType.ASSOCIATION),
      imgPath: '/assets/icons/class_editor/relationships/', type: 'association', shape: undefined
    },
    {
      id: RelationshipType.AGGREGATION, label: RelationshipType.getLabelFromRelationshipType(RelationshipType.AGGREGATION),
      imgPath: '/assets/icons/class_editor/relationships/aggregation.png', type: 'aggregation', shape: undefined
    },
    {
      id: RelationshipType.COMPOSITION, label: RelationshipType.getLabelFromRelationshipType(RelationshipType.COMPOSITION),
      imgPath: '/assets/icons/class_editor/relationships/composition.png', type: 'composition', shape: undefined
    }
  ]
};

const matchingOperatorPalettes = [
  {
    id: MatchingOperatorType.EQUAL, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.EQUAL),
    imgPath: '/assets/icons/class_editor/matching/equal_reduced.png', type: 'matchingOperator'
  },
  {
    id: MatchingOperatorType.LESS, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.LESS),
    imgPath: '/assets/icons/class_editor/matching/lt_reduced.png', type: 'matchingOperator'
  },
  {
    id: MatchingOperatorType.GREATER, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.GREATER),
    imgPath: '/assets/icons/class_editor/matching/gt_reduced.png', type: 'matchingOperator'
  },
  {
    id: MatchingOperatorType.LESS_EQUAL, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.LESS_EQUAL),
    imgPath: '/assets/icons/class_editor/matching/lteq_reduced.png', type: 'matchingOperator'
  },
  {
    id: MatchingOperatorType.GREATER_EQUAL, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.GREATER_EQUAL),
    imgPath: '/assets/icons/class_editor/matching/gteq_reduced.png', type: 'matchingOperator'
  },
  {
    id: MatchingOperatorType.EXISTS, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.EXISTS),
    imgPath: '/assets/icons/class_editor/matching/exists_reduced.png', type: 'matchingOperator'
  },
  {
    id: MatchingOperatorType.ALL, label: MatchingOperatorType.getLabelForMatchingOperatorType(MatchingOperatorType.ALL),
    imgPath: '/assets/icons/class_editor/matching/all_reduced.png', type: 'matchingOperator'
  },
];

const matchingConnectorPalettes = [
  { id: 'connector', label: 'verbinder', imgPath: '/assets/mxgraph_resources/images/connect.gif', type: 'connector' },

];

const deleteOperationPalette =
  { id: 'delete', label: 'löschen', imgPath: '/assets/mxgraph_resources/images/delete.gif', type: 'operation' }
  ;

const propertyTypePalettes = [
  { id: PropertyType.TEXT, label: PropertyType.getLabelForPropertyType(PropertyType.TEXT), imgPath: '/assets/icons/datatypes/s.png' },
  { id: PropertyType.LONG_TEXT, label: PropertyType.getLabelForPropertyType(PropertyType.LONG_TEXT), imgPath: '/assets/icons/datatypes/s.png' },
  { id: PropertyType.WHOLE_NUMBER, label: PropertyType.getLabelForPropertyType(PropertyType.WHOLE_NUMBER), imgPath: '/assets/icons/datatypes/n.png' },
  { id: PropertyType.FLOAT_NUMBER, label: PropertyType.getLabelForPropertyType(PropertyType.FLOAT_NUMBER), imgPath: '/assets/icons/datatypes/f.png' },
  { id: PropertyType.BOOL, label: PropertyType.getLabelForPropertyType(PropertyType.BOOL), imgPath: '/assets/icons/datatypes/tf2.png' },
  { id: PropertyType.DATE, label: PropertyType.getLabelForPropertyType(PropertyType.DATE), imgPath: '/assets/icons/datatypes/d.png' },
  { id: PropertyType.LIST, label: PropertyType.getLabelForPropertyType(PropertyType.LIST), imgPath: '/assets/icons/datatypes/o.png' },
  { id: PropertyType.ENUM, label: PropertyType.getLabelForPropertyType(PropertyType.ENUM), imgPath: '/assets/icons/datatypes/o.png' },
];

const mxStyles = {

  // Classes
  classNormal: 'editable=0;' + 'shape=swimlane;resizable=0;' + 'fillColor=#000e8a;strokeColor=#000e8a;fontColor=#FFFFFF;fontSize=14;',
  classEnum: 'shape=swimlane;resizable=0;' + 'fillColor=#B05800;fontColor=#FFFFFF;strokeColor=#B05800;fontSize=14;' + 'portConstraint=north;',
  classFlexprodCollector: 'editable=0;' + 'shape=swimlane;resizable=0;' + 'fillColor=#700000;fontColor=#FFFFFF;strokeColor=#700000;fontSize=14;',

  property: 'movable=0;resizable=0;editable=0;deletable=0;selectable=0;' +
    'fillColor=rgb(54,115,41);fontColor=#FFFFFF;strokeColor=#FFFFFF;align=left;html=1;overflow=hidden;fontSize=14;',
  propertyEnum: 'movable=0;resizable=0;editable=0;deletable=0;selectable=0;' +
    'fillColor=#FFCC99;fontColor=#B05800;strokeColor=#B05800;align=left;html=1;overflow=hidden;' + 'portConstraint=eastwest',

  // Icons
  optionsIcon: 'shape=image;image=/assets/icons/class_editor/options_icon.png;noLabel=1;imageBackground=none;imageBorder=none;' +
    'movable=0;resizable=0;editable=0;deletable=0;selectable=0;',
  addClassSameLevelIcon: 'shape=image;image=/assets/mxgraph_resources/images/right_blue.png;noLabel=1;imageBackground=none;imageBorder=none;' +
    'movable=0;resizable=0;editable=0;deletable=0;selectable=0;',
  addClassNewLevelIcon: 'shape=image;image=/assets/mxgraph_resources/images/down_blue.png;noLabel=1;imageBackground=none;imageBorder=none;' +
    'movable=0;resizable=0;editable=0;deletable=0;selectable=0;',


  // Relationships
  inheritanceEnum: 'sideToSideEdgeStyle=1;startArrow=classic;endArrow=none;curved=1;html=1;strokeColor=#B05800',
  inheritance: 'sideToSideEdgeStyle=1;endArrow=none;startArrow=block;startSize=16;startFill=0;curved=1;html=1;strokeColor=#000e8a;',

  association: 'endArrow=none;html=1;curved=1;' + 'edgeStyle=orthogonalEdgeStyle;',
  associationCell: 'resizable=0;html=1;align=left;verticalAlign=bottom;labelBackgroundColor=#ffffff;fontSize=10;',
  aggregation: 'endArrow=none;html=1;startArrow=diamondThin;startSize=15;startFill=0;exitPerimeter=1;' +
    'strokeColor=#000e8a;' + 'curved=1;' + 'edgeStyle=orthogonalEdgeStyle;',
  composition: 'endArrow=none;html=1;startArrow=diamondThin;startSize=15;startFill=1;exitPerimeter=1;' +
    'strokeColor=#000e8a;' + 'curved=1;' + 'edgeStyle=orthogonalEdgeStyle;',

  // Matching

  matchingRowHeader: 'movable=0;resizable=0;editable=0;deletable=0;selectable=0;' +
    'fillColor=#000000;fontColor=#FFFFFF;strokeColor=#000000;' +
    'align=center;html=1;overflow=hidden;fontSize=30;fontFamily=roboto;fontStyle=bold;',
  matchingConnector: 'endArrow=classic;startArrow=none;html=1;curved=1;' + 'editable=0;selectable=1;deletable=1;' + 'edgeStyle=orthogonalEdgeStyle;',
  matchingOperator: 'resizable=0;editable=0;deletable=1;selectable=1;' + 'portConstraint=eastwest',
  matchingClassSeparator:
    'movable=0;resizable=0;editable=0;deletable=0;selectable=0;foldable=0;' +
    'fillColor=#000e8a;fontColor=#FFFFFF;strokeColor=#000e8a;align=center;html=1;overflow=hidden;fontSize=14;' + 'portConstraint=eastwest;',
  matchingProperty:
    'movable=0;resizable=0;editable=0;deletable=0;selectable=0;foldable=0;' +
    'fillColor=rgb(54,115,41);fontColor=#FFFFFF;strokeColor=#FFFFFF;align=left;html=1;overflow=hidden;fontSize=14;' + 'portConstraint=eastwest',
  matchingClassNormal:
    'shape=swimlane;movable=0;resizable=0;editable=0;deletable=0;selectable=0;foldable=0;' +
    'fillColor=#000e8a;strokeColor=#000e8a;fontColor=#FFFFFF;fontSize=14;' + 'portConstraint=eastwest',
  matchingClassFlexprodCollector:
    'shape=swimlane;movable=0;resizable=0;editable=0;deletable=0;selectable=0;foldable=0;' +
    'fillColor=#700000;fontColor=#FFFFFF;strokeColor=#700000;fontSize=14;' + 'portConstraint=eastwest',
};

const cellTypes = {
  property: { label: 'property', icon: '' },
  property_enum: { label: 'property_enum', icon: '' },

  add: { label: 'add', icon: '' },
  add_association: { label: 'property', icon: '' },
  add_class_new_level: {},
  add_class_same_level: {},
  remove: {},

  inheritance: {},
  association: {},
  inheritance_enum: {},
  association_label: {}

};


export class CConstants {
  // public static sidebarPalettes = sidebarPalettes;
  public static relationshipPalettes = relationshipPalettes;
  public static propertyTypePalettes = propertyTypePalettes;
  public static matchingOperatorPalettes = matchingOperatorPalettes;
  public static matchingConnectorPalettes = matchingConnectorPalettes;
  public static deleteOperationPalette = deleteOperationPalette;
  public static mxStyles = mxStyles;
  public static cellTypes = cellTypes;
}

export class CUtils {

  public static getStandardObjects(marketplaceId: string, objectIdService: ObjectIdService, rootLabel?: string)
    : { classDefinitions: ClassDefinition[], relationships: Relationship[] } {

    const classDefinitions: ClassDefinition[] = [];
    const relationships: Relationship[] = [];


    const root = new ClassDefinition();
    root.id = objectIdService.getNewObjectId();
    root.marketplaceId = marketplaceId;

    if (!isNullOrUndefined(rootLabel)) {
      root.name = rootLabel;
    } else {
      root.name = '<Maschninen-\nName>';
    }

    root.root = true;
    root.classArchetype = ClassArchetype.ROOT;

    root.properties = [];

    classDefinitions.push(root);

    const flexProdclass = new ClassDefinition();
    flexProdclass.id = objectIdService.getNewObjectId();
    flexProdclass.marketplaceId = marketplaceId;
    flexProdclass.name = '<Komponenten-\nName>';
    flexProdclass.root = false;
    flexProdclass.classArchetype = ClassArchetype.FLEXPROD;

    flexProdclass.properties = [];

    classDefinitions.push(flexProdclass);

    const r1 = new Relationship();
    r1.id = objectIdService.getNewObjectId();
    r1.relationshipType = RelationshipType.AGGREGATION;
    r1.source = root.id;
    r1.target = flexProdclass.id;

    relationships.push(r1);

    return { classDefinitions: classDefinitions, relationships: relationships };

  }
}
