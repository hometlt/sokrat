


/**
 * Класс Область
 * Автор: Денис Пономарев
 *
 */


var SokratArea = function (options){
    SokratArea.superclass.constructor.call(this,options);

    this.types.type = "blob";
    var p = this.prop;
    for (var i = 0; i< p.len; i++)p.ps[i] = p.ps[i]||Math.toOrto(360/ p.len * i,50);

    this.init();
}
extend(SokratArea , GraphObject );
mixin( SokratArea.prototype, SokratAreaKineticView);
mixin( SokratArea.prototype, {

    alias: 'area',

    group: SOKRAT.GROUPS.FRAMES,

    defaults:{
        c: [0,0],
        ps: [],
        len: 3,
        pt:[0,0]
    },


    inside: function(x,y){
        var p = this.transformPoint([x,y]);
        var fillenabled = this.shapes.area.getFillEnabled();
        this.shapes.area.enableFill();
        var inside  = this.shapes.area.intersects(p[0],p[1]) ? 1: 0;
        this.shapes.area.setFillEnabled(fillenabled);
        return inside;
    }
});



GRAPH.CLASS["area"]  = SokratArea;

