var e = new Sokrat("editorCanvas").setScale(1);
 var graph = e.graph({graph :"focus",active: false, c: ["30%","90%"], label: "arrow", w:50, h: 50});
 e.render.createGraphElement(graph);

 var drag_object;
 graph.shapes.group.on('dragmove', function(event) {
 drag_object.setPoint(0, event.clientX / e.scale, event.clientY / e.scale);
 e.render.updateGraph(drag_object,10);
 e.render.update();
 });


 graph.shapes.group.setDraggable(true);
 graph.shapes.group.on('dragstart touchstart mousedown', function(event) {
 drag_object = e.graph({graph :"focus",active: false, c: ["30%","90%"], label: "arrow", w:50, h: 50});
 e.graphs[drag_object.name] = drag_object;
 e.render.createGraphElement(drag_object);
 //                        e.updateBounds();
 drag_object.setPoint(0, event.clientX / e.scale, event.clientY / e.scale);
 e.render.updateGraph(drag_object,10);
 e.render.update();

 e.select(drag_object);
 });




 graph = e.graph({graph :"focus",active: false,  c: ["50%","90%"], w:50, h: 50});
 e.render.createGraphElement(graph);
 graph = e.graph({graph :"focus",active: false,  c: ["70%","90%"], w:50, h: 50});
 e.render.createGraphElement(graph);


 e.updateBounds();
