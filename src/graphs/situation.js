

var SokratSituation = function (options){
    SokratSituation.superclass.constructor.call(this,options);
    this.types.type = "spline";
    this.init();
};

extend(SokratSituation , SokratArea );
mixin( SokratSituation.prototype, SokratAreaKineticView);
mixin( SokratSituation.prototype, {

    alias: "situation",
    group: SOKRAT.GROUPS.FRAMES,

    init: function(p,d,t){

      //  d.helper = {CREATE: SH.PATH, ATTRS: CSS.DASH};
    },

    defaults:{
        ps: [[0,0],[100,50],[100,100]],
        len: 3,
        pt:[0,0],
        c:[0,0]
    },

    inside: function(x,y){

        var p = this.prop;
        var Ax = p.ps[0][0], Ay = p.ps[0][1], Bx = p.ps[1][0], By = p.ps[1][1], Cx = p.ps[2][0], Cy = p.ps[2][1];

        //проверямая точка должна лежать по лну сторону от линий образованных от двух дрегих точек ситуации
        if( Math.lowerThanLine(Cx,Cy,Bx,By,Ax,Ay) != Math.lowerThanLine(Cx,Cy,Bx,By,x,y) )
        return 2;

        if( Math.lowerThanLine(Ax,Ay,Bx,By,Cx,Cy) != Math.lowerThanLine(Ax,Ay,Bx,By,x,y) )
        return 2;

        //если центральная точка находится по противоположную сторону от линии ,
        // образованной двумя крайними точками ситуации, что и проверяемая точка,
        //значит проверяемая точка лежит внтри области
        if( Math.lowerThanLine(Ax,Ay,Cx,Cy,Bx,By) != Math.lowerThanLine(Ax,Ay,Cx,Cy,x,y) )
        return 1;

        return 1;
        //todo

        //        return this.shapes.sub.isPointInside(x,y)?1:0;

    }


});

GRAPH.CLASS["situation"]  = SokratSituation;









/**
 * Класс Блок
 * Автор: Пономарев Денис
 * Date: 16.03.12
 */
//
//var Siedge = GraphExt(GraphObject,{
//
//    alias: "siedge",
//    group: SOKRAT.GROUPS.FRAMES,
//    init: function(p,d,t){
//        d.sub  = {CREATE: SH.PATH, DRAG: p.c, CONNECTOR : 1, UPDATE: p.c,
//            ATTRS: [CSS.LINE,{path:[["M",-p.a,0], ["C",-p.w,p.h,p.w,p.h,p.a,0]]}]};
//        d.text = {CREATE: SH.TEXT, ATTRS: CSS.TEXT,  DRAG: p.c ,BLANKET: BL.RECT, UPDATE: p.c /*, UPDATE: G.U_TEXT*/};
//        d.sub2 = {CREATE: SH.CIRCLE, ATTRS: [CSS.INV,{r:60}], CONNECTOR: 2, UPDATE: p.c};
//    },
//
//    layer: 0 ,
//
//    defaults:{
//        w:400,
//        h:400,
//        a:60,
//        c: [0,0]
//    },
//
//    getBbox: function(){
//        var p = this.prop;
//        return  {x:p.c[0] - p.w/2,y:p.c[1],x2:p.c[0] + p.w/2,y2:p.c[1] + p.h};
//    },
//
//    //todo сделать класс FRAME
//    sokratConnection: function(graph,port){
//
//        var port1;
//        if(graph.group == SOKRAT.GROUPS.POSITIONS || graph.group == SOKRAT.GROUPS.BLOCKS){
//            var pos = graph.prop.c;
//            if(port1 = this.inside(pos[0],pos[1])){
//                this.sokrat.connect(this,port1,graph,10);
//            }
//        }
//        if(graph.group == SOKRAT.GROUPS.ARROWS){
//            if(port == 1 || !port){
//                var pos = graph.prop.p1;
//                if(port1 = this.inside(pos[0],pos[1])){
//                    this.sokrat.connect(this,port1,graph,1);
//                }
//            }
//            if(port == 2 || !port){
//                var pos = graph.prop.p2;
//                if(port1 = this.inside(pos[0],pos[1])){
//                    this.sokrat.connect(this,port1,graph,2);
//                }
//            }
//            if(this.prop.ps)
//            for(var i= 0;i<this.prop.ps.length; i++){
//                if(port == i + 3 || !port){
//                    var pos = graph.prop.ps[i];
//                    if(port1 = this.inside(pos[0],pos[1])){
//                        this.sokrat.connect(this,port1,graph,3+i);
//                    }
//                }
//            }
//        }
//    },
//
//
//
//   inside: function( x , y ){
//      var p = this.prop;
//       if ( Math.distance( x , y , p.c[0], p.c[1] ) < p.a ) return 2;
//       if ( this.shapes.sub.isPointInside( x - p.c[0] , y - p.c[0] ) ) return 1 ;
//       return 0;
//   }
//
//});
