import { StudentFigure } from './StudentFigure.js';
import { box, palette } from './Props.js';
export class TutorFigure extends StudentFigure {
  constructor(){super(palette.amber);this.pointer=box([.035,.035,1.2],palette.paper,[0,-.38,.48]);this.elbows[1].add(this.pointer);this.scale.setScalar(1.06);}
  setPresence(amount){this.visible=amount>.01;this.scale.setScalar(1.06);this.traverse(object=>{if(object.material){object.material.transparent=true;object.material.opacity=amount;}});}
}
