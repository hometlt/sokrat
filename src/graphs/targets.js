/**
 * Класс Область
 * Автор: Денис Пономарев
 *
 */


var SokratTargets = function (options){
    SokratTargets.superclass.constructor.call(this,options);

    this.types.type = "targets";
    this.init();
}
extend(SokratTargets , GraphObject );
mixin( SokratTargets.prototype, SokratAreaKineticView);
mixin( SokratTargets.prototype, {

    alias: "targets",
    group: SOKRAT.GROUPS.FRAMES,

    getBbox: function(){

        var p = this.prop;
        return  {x: p.c[0] - p.size,y:p.c[1] - p.size,x2:p.c[0] + p.size,y2:p.c[1] + p.size};
    },


    defaults: {
        c: [0,0],
        size: 300,
        labels : ["прошлое",'рефлексивное','будущее']
    },

    layer : 0,

    sokratConnection: function(graph,port){
        if( graph.group == SOKRAT.GROUPS.BLOCKS || graph.group == SOKRAT.GROUPS.POSITIONS ){
            var port = this.inside(graph.prop.c[0],graph.prop.c[1]);
            this.sokrat.connect( this, port, graph, 10 );
        }
    },

    inside: function(i,j){
        var angle =  Math.getAngle ( i - this.prop.c[0] , j - this.prop.c[1] ) - 90;
        if ( angle < 0 ) angle += 360;
        var inside = parseInt ( angle / ( 360 / this.prop.labels.length ) ) + 1;
        return inside;
    },

    updateLabel: function(){}
});

GRAPH.CLASS["targets"]  = SokratTargets;






/*
init: function(p,d,t){
    d.sub = {
        CREATE:
            function(paper,p){
                var path =[];
                for(var i=0;i< p.labels.length;i++ ){
                    var _c = Math.toOrto(90+ 360/p.labels.length * i,p.size);
                    path.push("M",0,0,_c[0],_c[1]);}
                return paper.path(path);
            },
        DRAG:   p.c,
        ATTRS:  CSS.LINE,
        UPDATE: p.c
    };

    for(var i = p.labels.length; i --;){
        (function addLabel(i){
            d["label" + i] = {
                CREATE: SH.TEXT,
                UPDATE: p.c,
                ATTRS:  CSS.TEXT,
                ATTRSF: function(p){
                    var _c = Math.toOrto(90+360/p.labels.length *( i+0.5),p.size/2);
                    return {
                        x: _c[0],
                        y: _c[1],
                        text: p.labels[i]
                    }
                }
            };
        })(i);
    }

},*/

