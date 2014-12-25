
/**
 * Класс Линия
 * Автор: Денис Пономарев
 *
 */

    //Drawing lines and arcs with arrow heads on HTML5 Canvas  by Patrick Horgan
    //http://www.dbp-consulting.com/tutorials/canvas/CanvasArrow.html

    //An example of HTML5 canvas dotted and dashed lines
//http://www.rgraph.net/blog/2013/january/html5-canvas-dashed-lines.html


var SokratLine = function (options){
    SokratLine.superclass.constructor.call(this,options);


    this.types.type = this.types.curve || options.curve ? "spline" : "line" ;

    this.data.drag0.disconnect = [1,2,3,4,5,6,7,8,9];

    if(this.types.separator){
        this.group = SOKRAT.GROUPS.FRAMES;
//        this.types.dashed = true;
    }

    var p = this.prop;
    for(var i = 0;i <p.middle;i++){
        if(!p.ps[i+2])p.ps.push([Math.random()*50,Math.random()*50])
    }

    this.init();
};

extend(SokratLine , GraphObject );
mixin( SokratLine.prototype, SokratAreaKineticView);
mixin( SokratLine.prototype, {
    alias: "line",
    group: SOKRAT.GROUPS.ARROWS,



    defaults :  {
        width: null,
        label: null,
        c: [0,0],
//        p1: [-30,-30],
//        p2: [30,30],
        pt: [0,0],
        ps: [[-30,-30],[30,30]],
        position: [],
        middle: 0,
        type: null,
        active: true
    },


    onMove: function(port){
        this.updateConnection();
    },

    sokratConnection: function(graph,port){
        var p = this.prop;
        var p2 = graph.prop;
        var G = this;

        if(this.types.separator && ( port == 1 || !port )){
            if(graph.group != SOKRAT.GROUPS.ARROWS){
                var _p1 = this.getPoint(1),  _p2 = this.getPoint(2);
                var lower = Math.lowerThanLine(
                    _p1[0],_p1[1],_p2[0],_p2[1], p2.c[0],p2.c[1]) ? 1:2;
                this.sokrat.connect(G,lower,graph,10);
            }
        }
        else if(this.types.blanket ){
            var pos, i, port1;

            if(graph.group == SOKRAT.GROUPS.ARROWS){
                for( i= 0;i<graph.prop.ps.length; i++){
                    if(port == i + 1 || !port){
                        pos = graph.getPoint(i+1);
                        if(port1 = this.inside(pos[0],pos[1])){
                            this.sokrat.connect(this,port1,graph,i + 1);
                        }
                    }
                }
            }
//            if(graph.group == SOKRAT.GROUPS.POSITIONS || graph.group == SOKRAT.GROUPS.BLOCKS){
//                if(port == 1 || !port)checkConnect(1,graph.prop.c);
//            }
        }
        return [];
    },

    onConnect: function(port1,graph2,port2){
        if(this.types.blanket){
            var p = this.prop;

            if( graph2.group == SOKRAT.GROUPS.ARROWS  ){
                //todo рассчет растояние до начала стрелки

                var _p = graph2.getPoint(port2);
                var _len = this.len();
                var _dist =  Math.distance(  p.ps[0][0], p.ps[0][1],_p[0],_p[1] );
                graph2.prop.position[port2] = _dist/_len;
            }
        }

        //использование специальных цветов
        if(port1 !=10 && graph2.group != SOKRAT.GROUPS.FRAMES && this.group != SOKRAT.GROUPS.FRAMES){
            var graphClassStyle = this.sokrat.level.graphs[this.gsense];
            this.shapes["drag" + port1 ].setAttrs(

                graphClassStyle&& graphClassStyle["attrs-draggers"] ?
                    graphClassStyle["attrs-draggers"] :
                    this.style.DRAG_CONNECTED);
        }
    },

    onDisconnect: function(port1,graph2,port2){
        if(port1 !=10 && graph2.group != SOKRAT.GROUPS.FRAMES && this.group != SOKRAT.GROUPS.FRAMES){
            this.shapes["drag" + port1 ].setAttrs(this.style.DRAG_DISCONNECTED);
        }
    },

    updateConnection: function(){

        var p = this.prop;
        if(!this.created)return;

        if(this.types.blanket){

            var arrows = this.connections[10];

            for(var i in arrows){

                var graph = arrows[i][0], port =  arrows[i][1];

                if( graph.group != SOKRAT.GROUPS.ARROWS )continue;
//                var point = this.shapes.line.getPointAtLength( E.cns[i].position * this.shapes.line.getTotalLength() );


                var point = this.getPoint(1);
                var point2 = this.getPoint(2);
               var dx = point2[0] - point[0];
               var dy = point2[1] - point[1];



                graph.setPoint(port,  point[0] + dx * graph.prop.position[port] ,  point[1] + dy * graph.prop.position[port]);

                this.sokrat.render.updateGraph(graph);

                //todo использовать cns.len и водить стрелку (для блок стрелки в задаче табак)
            }
        }
    },


    inside: function(x,y){


        var p = this.prop;

        var p1 = this.getPoint(1), p2 = this.getPoint(2);

        if(this.types.blanket){

            if(this.types.type == "line"){
                this.shapes.area.setStrokeWidth(30);
                var inside  = this.shapes.area.intersects(this.transformPoint([x,y])) ? 1: 0;
                this.shapes.area.setStrokeWidth(2);
                if(inside) return 10;
            }


//            if(Raphael&& Raphael.isPointInsidePath(this.shapes.blanket.attr("path"), x+ p.c[0],y+p.c[1]))return 3;
//            if(this.shapes.area.intersects(x,y))return 3;
        }
        if(this.types.separator){
            return Math.lowerThanLine(p1[0] ,p1[1],p2[0],p2[1],x,y)?1:2;
        }

        return 0;
        //    if( this.shapes.drag1.blanket.isPointInside(x,y))return 1;
        //    if( this.shapes.drag2.blanket.isPointInside(x,y))return 2;
        //    return 0;
    },

    layer : 2,

//    angle: function(){
//        var p = this.prop;
//        return Math.getAngle(p.p2[0] - p.p1[0] , p.p2[1] - p.p1[1] );
//    },

    len: function(){
        var p1 = this.getPoint(1), p2 = this.getPoint(2);
        return Math.distance( p1[0],p1[1],p2[0], p2[1] );
    }

});


GRAPH.CLASS["line"]  = SokratLine;

GRAPH.CLASS["arrow"] = {graph:"line-arrow"};
