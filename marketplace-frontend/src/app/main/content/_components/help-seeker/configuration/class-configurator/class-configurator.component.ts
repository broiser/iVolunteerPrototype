import { Component, OnInit, Input, ViewChild, ElementRef, AfterContentInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Marketplace } from 'app/main/content/_model/marketplace';
import { ClassDefinition, ClassArchetype } from 'app/main/content/_model/meta/class';
import { mxgraph } from 'mxgraph';
import { Relationship, RelationshipType, Association, AssociationCardinality, Inheritance } from 'app/main/content/_model/meta/relationship';
import { isNullOrUndefined } from 'util';
import { PropertyType, ClassProperty } from 'app/main/content/_model/meta/property';
import { EditorPopupMenu } from './popup-menu';
import { ObjectIdService } from '../../../../_service/objectid.service.';
import { CConstants } from './utils-and-constants';
import { MyMxCell, MyMxCellType } from '../myMxCell';
import { ClassConfiguration } from '../../../../_model/configurations';
import { TopMenuResponse } from './top-menu-bar/top-menu-bar.component';
import { ClassOptionsOverlayContentData } from './options-overlay/options-overlay-content/options-overlay-content.component';
import { DialogFactoryDirective } from '../../../../_shared_components/dialogs/_dialog-factory/dialog-factory.component';
import { Helpseeker } from 'app/main/content/_model/helpseeker';

declare var require: any;

const mx: typeof mxgraph = require('mxgraph')({
  // mxDefaultLanguage: 'de',
  // mxBasePath: './mxgraph_resources',
});

// tslint:disable-next-line: class-name


@Component({
  selector: 'app-class-configurator',
  templateUrl: './class-configurator.component.html',
  styleUrls: ['./class-configurator.component.scss'],
  providers: [DialogFactoryDirective]

})
export class ClassConfiguratorComponent implements OnInit, AfterContentInit {

  constructor(
    private router: Router,
    private objectIdService: ObjectIdService,
    private dialogFactory: DialogFactoryDirective,
  ) { }

  @Input() marketplace: Marketplace;
  @Input() helpseeker: Helpseeker;

  classDefinitions: ClassDefinition[];
  deletedClassIds: string[];
  relationships: Relationship[];
  deletedRelationshipIds: string[];
  currentClassConfiguration: ClassConfiguration;

  modelUpdated: boolean;

  popupMenu: EditorPopupMenu;

  eventResponse: TopMenuResponse;

  rightSidebarVisible: boolean;

  hiddenEdges: MyMxCell[];

  @ViewChild('graphContainer', { static: true }) graphContainer: ElementRef;
  @ViewChild('rightSidebarContainer', { static: true }) rightSidebarContainer: ElementRef;

  graph: mxgraph.mxGraph;
  folding: boolean;

  rootCell: MyMxCell;
  rootCellSet: boolean;

  relationshipType: RelationshipType;

  quickEditMode: boolean;
  clickToDeleteMode: boolean;
  confirmDelete: boolean;
  deleteRelationships: boolean;

  saveDone: boolean;

  // Overlay
  displayOverlay: boolean;
  overlayContent: ClassOptionsOverlayContentData;
  overlayEvent: PointerEvent;

  /**
   * ******INITIALIZATION******
   */

  ngOnInit() {
    this.classDefinitions = [];
    this.deletedClassIds = [];
    this.relationships = [];
    this.deletedRelationshipIds = [];
    this.rightSidebarVisible = true;
    this.hiddenEdges = [];
    this.eventResponse = new TopMenuResponse();
    this.relationshipType = RelationshipType.INHERITANCE;
    this.confirmDelete = true;
    this.deleteRelationships = true;
    this.clickToDeleteMode = false;
    this.quickEditMode = false;
  }

  ngAfterContentInit() {
    this.graphContainer.nativeElement.style.position = 'absolute';
    this.graphContainer.nativeElement.style.overflow = 'hidden';
    this.graphContainer.nativeElement.style.left = '0px';
    this.graphContainer.nativeElement.style.top = '35px';
    this.graphContainer.nativeElement.style.right = '0px';
    this.graphContainer.nativeElement.style.bottom = '0px';
    this.graphContainer.nativeElement.style.background = 'white';

    this.rightSidebarContainer.nativeElement.style.position = 'absolute';
    this.rightSidebarContainer.nativeElement.style.overflow = 'auto';
    this.rightSidebarContainer.nativeElement.style.right = '0px';
    this.rightSidebarContainer.nativeElement.style.top = '35px';
    this.rightSidebarContainer.nativeElement.style.width = '300px';
    this.rightSidebarContainer.nativeElement.style.bottom = '0px';
    this.rightSidebarContainer.nativeElement.style.background = 'rgba(255, 255, 255, 0.9)';
    this.rightSidebarContainer.nativeElement.style.color = 'black';
    this.rightSidebarContainer.nativeElement.style.borderLeft = 'solid 2px black';

    this.graph = new mx.mxGraph(this.graphContainer.nativeElement);
    this.graph.isCellSelectable = function (cell) {
      const state = this.view.getState(cell);
      const style = (state != null) ? state.style : this.getCellStyle(cell);

      return this.isCellsSelectable() && !this.isCellLocked(cell) && style['selectable'] !== 0;
    };

    const outer = this;
    this.graph.getCursorForCell = function (cell: MyMxCell) {
      if (cell.cellType === MyMxCellType.PROPERTY
        || cell.cellType === MyMxCellType.ADD_PROPERTY_ICON
        || cell.cellType === MyMxCellType.REMOVE_ICON
        || cell.cellType === MyMxCellType.ADD_CLASS_SAME_LEVEL_ICON
        || cell.cellType === MyMxCellType.ADD_CLASS_NEXT_LEVEL_ICON
        || cell.cellType === MyMxCellType.ADD_ASSOCIATION_ICON
        || cell.cellType === MyMxCellType.OPTIONS_ICON
        || (outer.clickToDeleteMode && cell.cellType === MyMxCellType.CLASS)
        || (outer.clickToDeleteMode && MyMxCellType.isRelationship(cell.cellType))
      ) {
        return mx.mxConstants.CURSOR_TERMINAL_HANDLE;
      }
    };

    const modelGetStyle = this.graph.model.getStyle;

    this.graph.model.getStyle = function (cell) {
      if (cell != null) {
        let style = modelGetStyle.apply(this, arguments);

        if (this.isCollapsed(cell)) {
          style = style + ';shape=rectangle';
        }
        return style;
      }
      return null;
    };

    if (!mx.mxClient.isBrowserSupported()) {
      mx.mxUtils.error('Browser is not supported!', 200, false);
    } else {
      // Disables the built-in context menu
      mx.mxEvent.disableContextMenu(this.graphContainer.nativeElement);

      // Enables rubberband selection
      // tslint:disable-next-line: no-unused-expression
      new mx.mxRubberband(this.graph);

      this.graph.setPanning(true);

      this.graph.popupMenuHandler = this.createPopupMenu(this.graph);
      this.graph.tooltipHandler = new mx.mxTooltipHandler(this.graph, 100);

      /**
       * ******EVENT LISTENERS******
       */

      this.graph.addListener(mx.mxEvent.CLICK,
        function (sender: mxgraph.mxGraph, evt: mxgraph.mxEventObject) {
          const mouseEvent = evt.getProperty('event');

          if (outer.clickToDeleteMode && mouseEvent.button === 0) {
            outer.handleClickToDeleteEvent(evt);
          } else {

            if (mouseEvent.button === 0 && outer.graph.enabled) {
              outer.handleMXGraphLeftClickEvent(evt);

            } else if (mouseEvent.button === 2 && outer.graph.enabled) {
              outer.handleMXGraphRightClickEvent(evt);
            }
          }
        });

      this.graph.addListener(mx.mxEvent.FOLD_CELLS,
        function (sender: mxgraph.mxGraph, evt: mxgraph.mxEventObject) {
          const cells: MyMxCell[] = evt.getProperty('cells');
          const cell = cells.pop();
          outer.handleMXGraphFoldEvent(cell);
        });

      this.graph.addListener(mx.mxEvent.DOUBLE_CLICK,
        function (sender: mxgraph.mxGraph, evt: mxgraph.mxEventObject) {
          outer.handleMXGraphDoubleClickEvent(evt);
        });

      this.loadServerContent();
      // this.collapseGraph();
    }
  }

  private createPopupMenu(graph) {
    this.popupMenu = new EditorPopupMenu(graph, this);
    return this.popupMenu.createPopupMenuHandler(graph);
  }

  /**
   * ******CONTENT-RELATED FUNCTIONS******
   */

  loadServerContent() {
    this.clearEditor();
    this.parseGraphContent();
    this.setLayout();
    this.modelUpdated = true;
  }

  clearEditor() {
    this.graph.getModel().beginUpdate();
    try {
      this.graph.getModel().clear();
      this.hiddenEdges = [];
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private parseGraphContent() {
    this.parseIncomingClasses();
    this.parseIncomingRelationships();
    this.rootCellSet = false;
  }

  /**
   * ******CLASSES******
   */

  private parseIncomingClasses() {
    try {
      this.graph.getModel().beginUpdate();
      for (const c of this.classDefinitions) {
        this.insertClassIntoGraph(c);
      }
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private insertClassIntoGraph(classDefinition: ClassDefinition, geometry?: mxgraph.mxGeometry, replaceCell?: MyMxCell) {
    // create class cell
    let cell: MyMxCell;
    let style: string;

    if (classDefinition.classArchetype.startsWith('ENUM')) {
      style = CConstants.mxStyles.classEnum;
    } else if (classDefinition.collector) {
      style = CConstants.mxStyles.classFlexprodCollector;
    } else {
      style = CConstants.mxStyles.classNormal;
    }

    if (isNullOrUndefined(geometry)) {
      geometry = new mx.mxGeometry(0, 0, 110, 45);
    }

    if (!isNullOrUndefined(replaceCell)) {
      cell = replaceCell;
      this.graph.removeCells(cell.children);
      this.graph.setCellStyle(style, [cell]);

    } else {
      cell = new mx.mxCell(classDefinition.name, geometry, style) as MyMxCell;
    }

    cell.root = classDefinition.root;
    cell.writeProtected = classDefinition.writeProtected;

    if (cell.root) {
      if (!this.rootCellSet) {
        this.rootCell = cell;
        cell.root = classDefinition.root;
        this.rootCellSet = true;
      } else {
        cell.root = false;
        console.error('root cell already set - there must not be more than one root cell!');
      }
    }

    cell.setCollapsed(false);
    cell.cellType = MyMxCellType.CLASS;
    cell.classArchetype = classDefinition.classArchetype;
    cell.value = classDefinition.name;
    cell.setVertex(true);
    cell.setConnectable(true);

    if (!isNullOrUndefined(classDefinition.imagePath)) {
      const overlay =
        new mx.mxCellOverlay(new mx.mxImage(classDefinition.imagePath, 30, 30), 'Overlay', mx.mxConstants.ALIGN_RIGHT, mx.mxConstants.ALIGN_TOP);
      this.graph.addCellOverlay(cell, overlay);
    }

    if (!isNullOrUndefined(classDefinition.id)) {
      cell.id = classDefinition.id;
    } else {
      cell.id = this.objectIdService.getNewObjectId();
    }

    cell.geometry.alternateBounds = new mx.mxRectangle(0, 0, 110, 50);
    cell.geometry.setRect(cell.geometry.x, cell.geometry.y, cell.geometry.width, classDefinition.properties.length * 20 + 80);

    // create properties TODO @Alex Refactor
    let yLocation = 5;
    yLocation = this.addPropertiesToCell(cell, classDefinition.properties, yLocation);

    // next icon
    if (cell.classArchetype !== ClassArchetype.ENUM_HEAD && cell.classArchetype !== ClassArchetype.ROOT
      && cell.classArchetype && !cell.classArchetype.endsWith('_HEAD')) {

      const nextIcon: MyMxCell = this.graph.insertVertex(
        cell, 'add_class_same_level_icon', 'add class',
        85, yLocation + 50, 20, 20, CConstants.mxStyles.addClassSameLevelIcon) as MyMxCell;
      nextIcon.setConnectable(false);
      nextIcon.cellType = MyMxCellType.ADD_CLASS_SAME_LEVEL_ICON;
    }

    // down icon
    if (cell.classArchetype !== ClassArchetype.ROOT) {
      const downIcon: MyMxCell = this.graph.insertVertex(
        cell, 'add_class_next_level_icon', 'add class',
        65, yLocation + 50, 20, 20, CConstants.mxStyles.addClassNewLevelIcon) as MyMxCell;
      downIcon.setConnectable(false);
      downIcon.cellType = MyMxCellType.ADD_CLASS_NEXT_LEVEL_ICON;
    }

    // options icon
    const optionsIcon: MyMxCell = this.graph.insertVertex(
      cell, 'options', 'options', 5, yLocation + 50, 20, 20, CConstants.mxStyles.optionsIcon) as MyMxCell;
    optionsIcon.setConnectable(false);
    optionsIcon.cellType = MyMxCellType.OPTIONS_ICON;

    if (isNullOrUndefined(replaceCell)) {
      return this.graph.addCell(cell);
    } else {
      return cell;
    }
  }

  /**
   * ******PROPERTIES******
   */
  private addPropertiesToCell(cell: MyMxCell, properties: ClassProperty<any>[], yLocation: number): number {
    if (!isNullOrUndefined(properties)) {
      for (const p of properties) {
        const propertyEntry: MyMxCell = this.graph.insertVertex(cell, p.id, p.name, 5, yLocation + 45, 100, 20, CConstants.mxStyles.property) as MyMxCell;

        if (p.type === PropertyType.ENUM) {
          propertyEntry.cellType = MyMxCellType.ENUM_PROPERTY;
          propertyEntry.setStyle(CConstants.mxStyles.propertyEnum);
        } else {
          propertyEntry.cellType = MyMxCellType.PROPERTY;
        }
        propertyEntry.setConnectable(false);

        propertyEntry.propertyId = p.id;
        yLocation += 20;
      }
    }
    return yLocation;
  }

  /**
    * ******RELATIONSHIPS******
    */

  private parseIncomingRelationships() {
    try {
      this.graph.getModel().beginUpdate();
      for (const r of this.relationships) {
        const rel: MyMxCell = this.insertRelationshipIntoGraph(r, new mx.mxPoint(0, 0), false) as MyMxCell;
        if (rel.cellType === MyMxCellType.ASSOCIATION) {
          this.addHiddenRelationshipHack(rel);
        }
      }
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private insertRelationshipIntoGraph(r: Relationship, coords: mxgraph.mxPoint, createNew: boolean) {

    const parent = this.graph.getDefaultParent();
    const source: MyMxCell = this.graph.getModel().getCell(r.source) as MyMxCell;
    const target: MyMxCell = this.graph.getModel().getCell(r.target) as MyMxCell;

    let cell: MyMxCell;

    if (r.relationshipType === RelationshipType.INHERITANCE) {
      cell = new mx.mxCell(undefined, new mx.mxGeometry(coords.x, coords.y, 0, 0), CConstants.mxStyles.inheritance) as MyMxCell;
      cell.cellType = MyMxCellType.INHERITANCE;

      if (source.classArchetype.startsWith('ENUM_')) {
        cell.setStyle(CConstants.mxStyles.inheritanceEnum);
      }

    } else if (r.relationshipType === RelationshipType.ASSOCIATION) {
      cell = new mx.mxCell('', new mx.mxGeometry(coords.x, coords.y, 0, 0), CConstants.mxStyles.association) as MyMxCell;
      cell.cellType = MyMxCellType.ASSOCIATION;

      const cell1 = new mx.mxCell(AssociationCardinality[(r as Association).sourceCardinality],
        new mx.mxGeometry(-0.8, 0, 0, 0), CConstants.mxStyles.associationCell) as MyMxCell;
      this.addAssociationLabel(cell1, cell);

      const cell2 = new mx.mxCell(AssociationCardinality[(r as Association).targetCardinality],
        new mx.mxGeometry(0.8, 0, 0, 0), CConstants.mxStyles.associationCell) as MyMxCell;
      this.addAssociationLabel(cell2, cell);

    } else if (r.relationshipType === RelationshipType.AGGREGATION) {
      cell = new mx.mxCell(undefined, new mx.mxGeometry(coords.x, coords.y, 0, 0), CConstants.mxStyles.aggregation) as MyMxCell;
      cell.cellType = MyMxCellType.AGGREGATION;

    } else if (r.relationshipType === RelationshipType.COMPOSITION) {
      cell = new mx.mxCell(undefined, new mx.mxGeometry(coords.x, coords.y, 0, 0), CConstants.mxStyles.composition) as MyMxCell;
      cell.cellType = MyMxCellType.COMPOSITION;
    } else {
      console.error('invalid RelationshipType');
    }

    cell.id = r.id;
    // cell.newlyAdded = createNew;
    cell.geometry.relative = true;
    cell.edge = true;

    return this.graph.addEdge(cell, parent, source, target);
  }

  private addAssociationLabel(associationCell: MyMxCell, daddyCell: MyMxCell) {
    associationCell.geometry.relative = true;
    associationCell.setConnectable(false);
    associationCell.vertex = true;
    associationCell.cellType = MyMxCellType.ASSOCIATION_LABEL;
    associationCell.setVisible(false);

    if (isNullOrUndefined(associationCell.value)) {
      associationCell.value = AssociationCardinality.ONE;
    }
    daddyCell.insert(associationCell);
  }

  private addHiddenRelationshipHack(relationship: MyMxCell) {

    const sourceCell = relationship.source.getParent();
    const targetCell = relationship.target;

    const hack = new Association();
    hack.relationshipType = RelationshipType.ASSOCIATION;
    hack.source = sourceCell.id;
    hack.target = targetCell.id;
    hack.sourceCardinality = 'ONE';
    hack.targetCardinality = 'ONE';
    hack.id = this.objectIdService.getNewObjectId();

    const relationshipCell = new mx.mxCell('', new mx.mxGeometry(0, 0, 0, 0), CConstants.mxStyles.association) as MyMxCell;
    relationshipCell.cellType = MyMxCellType.ASSOCIATION;
    relationshipCell.setVertex(false);
    relationshipCell.setEdge(true);

    this.hiddenEdges.push(relationshipCell);
    this.graph.addCell(relationshipCell, this.graph.getDefaultParent(), undefined, sourceCell, targetCell);
  }

  /**
  * ******DELETE******
  */

  private deleteCells(cells: MyMxCell[]) {
    if (this.confirmDelete) {
      this.dialogFactory.confirmationDialog('Löschen Bestätigen', 'Wirklich löschen?').then((ret: boolean) => {
        if (ret) {
          this.performDelete(cells);
        }
      });
    } else {
      this.performDelete(cells);
    }
  }

  private performDelete(cells: MyMxCell[]) {
    cells = cells.filter((c: MyMxCell) => !c.writeProtected);
    const removedCells = this.graph.removeCells(cells, this.deleteRelationships) as MyMxCell[];

    if (isNullOrUndefined(removedCells)) {
      return;
    }
    this.deleteFromModel(removedCells);
  }

  private deleteFromModel(removedCells: MyMxCell[]) {

    for (const cell of removedCells) {
      if (cell.cellType === MyMxCellType.CLASS) {
        this.classDefinitions = this.classDefinitions.filter(c => c.id !== cell.id);
        this.deletedClassIds.push(cell.id);

      } else if (MyMxCellType.isRelationship(cell.cellType)) {
        this.relationships = this.relationships.filter(r => r.id !== cell.id);
        this.deletedRelationshipIds.push(cell.id);
      }
    }
  }

  /**
   * ******LAYOUT AND DRAWING******
   */

  private setLayout() {
    const layout: any = new mx.mxCompactTreeLayout(this.graph, false, false);
    // const layout: any = new mx.mxFastOrganicLayout(this.graph);
    layout.levelDistance = 50;
    layout.alignRanks = true;
    layout.minEdgeJetty = 50;
    layout.prefHozEdgeSep = 5;
    layout.resetEdges = false;
    layout.edgeRouting = true;

    layout.execute(this.graph.getDefaultParent(), this.rootCell);

    for (const edge of this.hiddenEdges) {
      this.graph.getModel().setVisible(this.graph.getModel().getCell(edge.id), false);
    }

    this.resetViewport();
  }

  // TODO @Alex fix issue in regards to saved Geometry
  redrawContent(focusCell: MyMxCell) {
    // let savedGeometry = this.saveGeometry();
    this.clearEditor();
    this.loadServerContent();
    // this.restoreGeometry(savedGeometry);
    // this.setLayout();
    this.focusOnCell(focusCell);
  }

  private focusOnCell(focusCell: MyMxCell) {
    const bounds = this.graph.getView().getGraphBounds();
    const scale = this.graph.getView().getScale();

    bounds.y *= -1;
    bounds.x *= -1;

    this.graph.getView().setScale(scale);
    if (!isNullOrUndefined(focusCell)) {
      this.graph.scrollCellToVisible(this.graph.getModel().getCell(focusCell.id), true);
    }
  }

  // TODO
  private saveGeometry(): { id: string, geometry: mxgraph.mxGeometry }[] {
    const cells = this.graph.getModel().getChildCells(this.graph.getDefaultParent());
    const savedGeometry: { id: string, geometry: mxgraph.mxGeometry }[] = [];
    for (const cell of cells) {
      savedGeometry.push({ id: cell.id, geometry: cell.geometry });
    }
    return savedGeometry;
  }

  // TODO
  private restoreGeometry(savedGeometries: { id: string, geometry: mxgraph.mxGeometry }[]) {
    const cells = this.graph.getModel().getChildCells(this.graph.getDefaultParent());

    for (const cell of cells) {
      const geometry = savedGeometries.find((g: any) => {
        return g.id === cell.id;
      });

      // keep width and height if number of properties changed
      const width = cell.geometry.width;
      const height = cell.geometry.height;
      cell.setGeometry(geometry.geometry);
      cell.geometry.width = width;
      cell.geometry.height = height;
    }
  }

  /**
   * ******EVENT HANDLING******
   */
  handleMXGraphLeftClickEvent(event: mxgraph.mxEventObject) {
    const cell: MyMxCell = event.getProperty('cell');

    // ZOOMSCALE
    // const scale = this.graph.view.getScale();
    // const translate = this.graph.view.getTranslate();
    // const bounds = this.graph.getGraphBounds();

    if (!isNullOrUndefined(cell)) {
      const parent = cell.getParent();


      if (cell.cellType === MyMxCellType.ADD_CLASS_SAME_LEVEL_ICON) {
        const ret = this.addClassWithRelationship(cell, this.graph.getIncomingEdges(parent)[0].source.id);
        const addedClass = ret.class;
        const addedRelationship = ret.relationship;

        const classCell = this.insertClassIntoGraph(
          addedClass, new mx.mxGeometry(parent.geometry.x + 130, parent.geometry.y, 110, 45));
        this.classDefinitions.push(addedClass);

        const relationshipCell = this.insertRelationshipIntoGraph(addedRelationship, new mx.mxPoint(0, 0), false);
        this.relationships.push(addedRelationship);

        // this.updateModel();
        if (!this.quickEditMode) {
          this.redrawContent(classCell as MyMxCell);
        }
      }

      if (cell.cellType === MyMxCellType.ADD_CLASS_NEXT_LEVEL_ICON) {
        const ret = this.addClassWithRelationship(cell, parent.id);
        const addedClass = ret.class;
        const addedRelationship = ret.relationship;

        const classCell = this.insertClassIntoGraph(
          addedClass, new mx.mxGeometry(parent.geometry.x, parent.geometry.y + parent.geometry.height + 20, 110, 45));
        this.classDefinitions.push(addedClass);

        const relationshipCell = this.insertRelationshipIntoGraph(addedRelationship, new mx.mxPoint(0, 0), false);
        this.relationships.push(addedRelationship);

        //  this.updateModel();
        if (!this.quickEditMode) {
          this.redrawContent(classCell as MyMxCell);
        }
      }

      if (cell.cellType === MyMxCellType.OPTIONS_ICON) {
        this.openOverlay(<MyMxCell>cell.getParent(), event);
      }

      // this.graph.view.scaleAndTranslate(scale, translate.x, translate.y);
      // bounds.x = bounds.x - 20;
      // this.graph.view.setGraphBounds(bounds);

      // this.modelUpdated = true;
    }
  }

  addClassWithRelationship(iconCell: MyMxCell, sourceId: string): { class: ClassDefinition, relationship: Relationship } {
    const addedClass = new ClassDefinition();
    addedClass.configurationId = this.currentClassConfiguration.id;

    const parentClassArchetype = (iconCell.getParent() as MyMxCell).classArchetype;

    addedClass.id = this.objectIdService.getNewObjectId();

    if (parentClassArchetype === ClassArchetype.ENUM_HEAD || parentClassArchetype === ClassArchetype.ENUM_ENTRY) {
      addedClass.classArchetype = ClassArchetype.ENUM_ENTRY;

      // } else if (parentClassArchetype.endsWith('_HEAD')) {
      //   addedClass.classArchetype = ClassArchetype[parentClassArchetype.substr(0, parentClassArchetype.length - 5)];
    } else {
      addedClass.classArchetype = parentClassArchetype;
    }

    addedClass.name = ClassArchetype.getClassArchetypeLabel(addedClass.classArchetype);
    addedClass.tenantId = this.helpseeker.tenantId;
    addedClass.properties = [];

    const addedRelationship = new Relationship();
    addedRelationship.relationshipType = this.relationshipType;
    addedRelationship.source = sourceId;
    addedRelationship.target = addedClass.id;
    addedRelationship.id = this.objectIdService.getNewObjectId();

    return { class: addedClass, relationship: addedRelationship };
  }

  handleMXGraphRightClickEvent(event: mxgraph.mxEventObject) {
    const pointerevent = event.getProperty('event') as PointerEvent;
  }


  handleMXGraphDoubleClickEvent(event: mxgraph.mxEventObject) {
    this.openOverlay(event.getProperty('cell'), event);
  }

  handleMXGraphFoldEvent(cell: MyMxCell) {
    const edges: MyMxCell[] = this.graph.getOutgoingEdges(cell) as MyMxCell[];

    if (!isNullOrUndefined(edges)) {
      for (const edge of edges) {
        if (!isNullOrUndefined(edge) && !isNullOrUndefined(edge.target)) {
          if (!edge.target.isCollapsed()) {
            // this.graph.foldCells(true, false, [edge.target]);
            if (cell.isCollapsed()) {
              this.setAllCellsInvisibleRec(cell);
            }
          } else {
            // this.graph.foldCells(false, false, [edge.target]);
            if (!cell.isCollapsed()) {

              // this.setAllCellsVisibleRec(cell);
              this.setNextCellVisible(cell);
            }
          }
        }
      }

      //  this.redrawContent(cell);
      for (const he of this.hiddenEdges) {
        he.setVisible(true);
      }
      this.setLayout();
      this.focusOnCell(cell);
    }

    this.modelUpdated = true;
  }

  handleClickToDeleteEvent(event: mxgraph.mxEventObject) {
    const cell = event.getProperty('cell') as MyMxCell;

    if (!isNullOrUndefined(cell)) {
      if (cell.cellType === MyMxCellType.CLASS || MyMxCellType.isRelationship(cell.cellType)) {
        this.deleteCells([cell]);
      }
    }
  }

  clickToDeleteModeToggled() {
    if (this.clickToDeleteMode) {
      this.graph.setEnabled(false);
    } else {
      this.graph.setEnabled(true);
    }
  }


  /**
   * ******OPTIONS OVERLAY******
   */

  private openOverlay(cell: MyMxCell, event: mxgraph.mxEventObject) {
    if (!isNullOrUndefined(cell) && (cell.cellType === MyMxCellType.CLASS || MyMxCellType.isRelationship(cell.cellType))) {
      this.overlayEvent = event.getProperty('event');

      this.overlayContent = new ClassOptionsOverlayContentData();
      this.overlayContent.marketplace = this.marketplace;
      this.overlayContent.helpseeker = this.helpseeker;

      if (cell.cellType === MyMxCellType.CLASS) {
        this.overlayContent.classDefinition = this.classDefinitions.find(c => c.id === cell.id);
        this.overlayContent.allClassDefinitions = this.classDefinitions;
        this.overlayContent.allRelationships = this.relationships;

      } else if (MyMxCellType.isRelationship(cell.cellType)) {
        this.overlayContent.relationship = this.relationships.find(r => r.id === cell.id);
      }

      this.graph.setPanning(false);
      this.graph.setEnabled(false);
      this.graph.setTooltips(false);
      this.displayOverlay = true;
    }
  }

  handleOverlayClosedEvent(event: ClassOptionsOverlayContentData) {
    this.graph.setPanning(true);
    this.graph.setEnabled(true);
    this.graph.setTooltips(true);
    this.displayOverlay = false;

    // tslint:disable-next-line: no-unused-expression
    !isNullOrUndefined(event) ? this.handleModelChanges(event.classDefinition) : '';

    this.overlayContent = undefined;
    this.overlayEvent = undefined;
  }

  handleModelChanges(classDefinition: ClassDefinition) {
    const i = this.classDefinitions.findIndex(c => c.id === classDefinition.id);
    const existingClassDefinition = this.classDefinitions[i];

    const cell = this.graph.getModel().getCell(classDefinition.id) as MyMxCell;
    try {
      this.graph.getModel().beginUpdate();
      const newCell = this.insertClassIntoGraph(classDefinition, undefined, cell);
    } finally {
      this.graph.getModel().endUpdate();
    }

    this.classDefinitions[i] = classDefinition;

    if (!this.quickEditMode && classDefinition.properties.length !== existingClassDefinition.properties.length) {
      this.redrawContent(cell);
    }
  }

  /**
   * ******COLLAPSING******
   */

  private collapseGraph() {
    const allVertices = this.graph.getChildVertices(this.graph.getDefaultParent());
    const rootVertice = allVertices.find((v: MyMxCell) => v.root);
    const rootEdges = this.graph.getOutgoingEdges(rootVertice);
    const headVertices: MyMxCell[] = [];

    for (const edge of rootEdges) {
      headVertices.push(edge.target);
    }

    this.graph.foldCells(true, false, [rootVertice]);
    this.graph.foldCells(false, false, [rootVertice]);
  }

  private setAllCellsInvisibleRec(cell: MyMxCell) {
    const edges: MyMxCell[] = this.graph.getOutgoingEdges(cell) as MyMxCell[];
    // console.log(cell);
    for (const edge of edges) {
      // this.graph.foldCells(true, false, [edge.target]);
      // this.graph.getModel().setVisible(edge.target, false);
      if (!edge.target.isCollapsed()) {
        this.graph.swapBounds(edge.target, true);
        this.graph.getModel().setCollapsed(edge.target, true);
      }
      this.graph.getModel().setVisible(edge.target, false);
      this.setAllCellsInvisibleRec(edge.target as MyMxCell);
    }

    let children = this.graph.getChildCells(cell) as MyMxCell[];
    children = children.filter(c => c.cellType === MyMxCellType.ENUM_PROPERTY);

    for (const child of children) {
      const childEdges = this.graph.getOutgoingEdges(child);

      for (const childEdge of childEdges) {
        this.graph.getModel().setVisible(childEdge.target, false);
        this.setAllCellsInvisibleRec(childEdge.target as MyMxCell);
      }
    }
  }

  private setAllCellsVisibleRec(cell: MyMxCell) {
    const edges: MyMxCell[] = this.graph.getOutgoingEdges(cell) as MyMxCell[];
    for (const edge of edges) {
      this.graph.getModel().setVisible(edge.target, true);
      this.setAllCellsVisibleRec(edge.target as MyMxCell);
    }
  }

  private setNextCellVisible(cell: MyMxCell) {
    const edges: MyMxCell[] = this.graph.getOutgoingEdges(cell) as MyMxCell[];
    for (const edge of edges) {
      // this.graph.getModel().setVisible(edge.target, true);
      // this.setAllCellsInvisibleRec(edge.target as myMxCell);
      // this.graph.swapBounds(edge.target, true);
      // this.graph.getModel().setCollapsed(edge.target, false);
      this.graph.getModel().setVisible(edge.target, true);

      let children = this.graph.getChildCells(cell) as MyMxCell[];
      children = children.filter(c => c.cellType === MyMxCellType.ENUM_PROPERTY);

      for (const child of children) {
        const childEdges = this.graph.getOutgoingEdges(child);

        for (const childEdge of childEdges) {
          this.graph.getModel().setVisible(childEdge.target, true);
        }
      }
    }
  }

  /**
   * ******ZOOMING******
   */
  zoomInEvent() {
    this.graph.zoomIn();
  }

  zoomOutEvent() {
    this.graph.zoomOut();
  }

  zoomResetEvent() {
    this.graph.zoomActual();
    this.resetViewport();
  }

  resetViewport() {
    const rootCell = this.graph.getModel().getChildCells(this.graph.getDefaultParent()).find((c: MyMxCell) => c.root);

    if (!isNullOrUndefined(rootCell)) {
      this.graph.scrollCellToVisible(rootCell, true);

      const translate = this.graph.view.getTranslate();
      const windowHeight = window.innerHeight;
      this.graph.view.setTranslate(translate.x, translate.y - (windowHeight / 2) + (rootCell.geometry.height + 25));
    }
  }


  /**
   * ******MENU FUNCTIONS******
   */

  async consumeMenuOptionClickedEvent(event: any) {
    this.eventResponse = new TopMenuResponse();
    switch (event.id) {
      case 'editor_save': {
        this.updateModel();
        this.eventResponse.action = 'save';
        this.eventResponse.classConfiguration = this.currentClassConfiguration;
        this.eventResponse.classDefintions = this.classDefinitions;
        this.eventResponse.relationships = this.relationships;
        this.eventResponse.deletedClassDefinitions = this.deletedClassIds;
        this.eventResponse.deletedRelationships = this.deletedRelationshipIds;
        break;
      } case 'editor_save_return': {
        this.openGraph(event.payload.classConfiguration, event.payload.classDefinitions, event.payload.relationships);
        break;

      } case 'editor_save_as': {
        console.log('not implemented');
        break;
      } case 'editor_new': {
        this.openGraph(event.payload.classConfiguration, event.payload.classDefinitions, event.payload.relationships);
        break;
      } case 'editor_open': {
        this.openGraph(event.payload.classConfiguration, event.payload.classDefinitions, event.payload.relationships);
        break;
      } case 'editor_delete': {
        if (!isNullOrUndefined(event.payload.idsToDelete)
          && event.payload.idsToDelete.find((id: string) => id === this.currentClassConfiguration.id)) {
          this.openGraph(undefined, [], []);
        }
        break;
      } case 'cancelled': {
        break;
      }
    }
    return;
  }

  openGraph(classConfiguration: ClassConfiguration, classDefinitions: ClassDefinition[], relationships: Relationship[]) {
    this.currentClassConfiguration = classConfiguration;
    this.relationships = relationships;
    this.classDefinitions = classDefinitions;
    this.deletedClassIds = [];
    this.deletedRelationshipIds = [];
    this.hiddenEdges = [];

    this.loadServerContent();
    // this.collapseGraph();
  }

  updateModel() {
    // store current connections in relationships
    const allCells = this.graph.getModel().getChildren(this.graph.getDefaultParent());

    for (const cd of this.classDefinitions) {
      const cell: MyMxCell = allCells.find((c: mxgraph.mxCell) => {
        return c.id === cd.id;
      }) as MyMxCell;

      if (!isNullOrUndefined(cell) && (cell.cellType === MyMxCellType.CLASS)) {
        cd.root = cell.root;
        cd.name = cell.value;
      }
    }

    for (const r of this.relationships) {
      const cell: MyMxCell = allCells.find((c: mxgraph.mxCell) => {
        return c.id === r.id;
      }) as MyMxCell;

      if (!isNullOrUndefined(cell.source)) {
        r.source = cell.source.id;
      }
      if (!isNullOrUndefined(cell.target)) {
        r.target = cell.target.id;
      }

      if (cell.cellType === MyMxCellType.INHERITANCE) {
        if (!isNullOrUndefined(cell.source)) {
          (<Inheritance>r).superClassId = cell.source.id;
        }
      } else if (cell.cellType === MyMxCellType.ASSOCIATION) {
        (<Association>r).sourceCardinality = AssociationCardinality.getAssociationParameterFromLabel(cell.getChildAt(0).value);
        (<Association>r).targetCardinality = AssociationCardinality.getAssociationParameterFromLabel(cell.getChildAt(1).value);

      } else if (cell.cellType === MyMxCellType.AGGREGATION || cell.cellType === MyMxCellType.COMPOSITION) {
        // TODO
      } else {
        // console.error('invalid cellType');
        // console.log(cell);
        // console.log(this.relationships);
      }
    }

    // update the configurator save file
    if (!isNullOrUndefined(this.currentClassConfiguration)) {
      this.currentClassConfiguration.classDefinitionIds = this.classDefinitions.map(c => c.id);
      this.currentClassConfiguration.relationshipIds = this.relationships.map(r => r.id);
    }
  }

  showSidebar() {
    this.rightSidebarVisible = true;
    this.rightSidebarContainer.nativeElement.style.borderLeft = 'solid 2px black';
    this.rightSidebarContainer.nativeElement.style.height = 'auto';
    this.rightSidebarContainer.nativeElement.style.width = '300px';
  }

  hideSidebar() {
    this.rightSidebarVisible = false;
    this.rightSidebarContainer.nativeElement.style.borderLeft = 'none';
    this.rightSidebarContainer.nativeElement.style.height = '35px';
    this.rightSidebarContainer.nativeElement.style.width = '35px';
  }

  /**
   * ******KEY LISTENER/HANDLER******
   */
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete') {
      const cells = this.graph.getSelectionCells() as MyMxCell[];
      this.deleteCells(cells);
    }
  }

  /**
   * ******DEBUGGING******
   */
  showInstanceForm() {

    const rootCell = this.graph.getSelectionCell() as MyMxCell;

    // if (!isNullOrUndefined(rootCell) && rootCell.root) {
    if (!isNullOrUndefined(rootCell) && !isNullOrUndefined(rootCell.edges.find((e: MyMxCell) => e.cellType === MyMxCellType.AGGREGATION))) {
      this.router.navigate([`main/configurator/instance-editor/${this.marketplace.id}/top-down`], { queryParams: [rootCell.id] });
    } else {

      // const rootCell = this.graph.getChildVertices(this.graph.getDefaultParent()).find((c: MyMxCell) => c.classArchetype === ClassArchetype.ROOT);
      // if (!isNullOrUndefined(rootCell) && !rootCell.root) {
      this.router.navigate([`main/configurator/instance-editor/${this.marketplace.id}/bottom-up`], { queryParams: [rootCell.id] });
    }
  }

  showExportDialog() {
    const rootCell = this.graph.getSelectionCell() as MyMxCell;

    if (!isNullOrUndefined(rootCell)) {
      this.dialogFactory.openPreviewExportDialog(this.marketplace, [rootCell.id]).then(() => {

      });
    }
  }


  showZoomLevel() {
    const scale = this.graph.view.getScale();
    console.log(this.graph.view.getScale());
    this.graph.zoomActual();
    console.log(this.graph.view.getScale());
    this.graph.view.setScale(scale);
  }

  doShitWithGraph(graph: mxgraph.mxGraph) {
    console.log(graph);
  }
  printModelToConsole() {
    console.log(this.classDefinitions);
    console.log(this.relationships);
    console.log(this.currentClassConfiguration);
  }

  // OLD STUFF - might still be needed later
  // handleMousedownEvent(event: any, paletteItempaletteEntry: any, item: any, graph: mxgraph.mxGraph) {
  //   const outer = this;
  //   let positionEvent: MouseEvent;

  //   const onDragstart = function (evt) {
  //     evt.dataTransfer.setData('text', item.id);
  //     evt.dataTransfer.effect = 'move';
  //     evt.dataTransfer.effectAllowed = 'move';
  //   };

  //   const onDragOver = function (evt) {
  //     positionEvent = evt;
  //   };

  //   const onDragend = function (evt) {
  //     evt.dataTransfer.getData('text');
  //     try {
  //       addObjectToGraph(evt, item);
  //     } finally {
  //       graph.getModel().endUpdate();
  //       removeEventListeners(outer);
  //     }

  //     function addObjectToGraph(dragEndEvent: MouseEvent, paletteItem: any) {

  //       const coords: mxgraph.mxPoint = graph.getPointForEvent(positionEvent, false);
  //       graph.getModel().beginUpdate();

  //       if (paletteItem.type === 'class') {
  //         const addedClass = new ClassDefinition();
  //         addedClass.name = paletteItem.label;
  //         addedClass.properties = [];
  //         addedClass.classArchetype = paletteItem.archetype;


  //         const cell = outer.insertClassIntoGraph(addedClass, new mx.mxGeometry(coords.x, coords.y, 80, 30), true);
  //         // cell.id = outer.objectIdService.getNewObjectId();
  //         addedClass.id = cell.id;
  //         outer.configurableClasses.push(addedClass);

  //       } else {
  //         const r = new Relationship();
  //         r.relationshipType = paletteItem.id;
  //         const cell = outer.insertRelationshipIntoGraph(r, coords, true);

  //         cell.id = outer.objectIdService.getNewObjectId();
  //         r.id = cell.id;
  //         outer.relationships.push(r);

  //       }
  //     }
  //   };

  //   const onMouseUp = function (evt) {
  //     removeEventListeners(outer);
  //   };

  //   event.srcElement.addEventListener('dragend', onDragend);
  //   event.srcElement.addEventListener('mouseup', onMouseUp);
  //   event.srcElement.addEventListener('dragstart', onDragstart);
  //   this.graphContainer.nativeElement.addEventListener('dragover', onDragOver);

  //   function removeEventListeners(outerScope: any) {
  //     event.srcElement.removeEventListener('dragend', onDragend);
  //     event.srcElement.removeEventListener('mouseup', onMouseUp);
  //     event.srcElement.removeEventListener('dragstart', onDragstart);
  //     outerScope.graphContainer.nativeElement.removeEventListener('dragover', onDragOver);

  //   }
  // }



}