/**
 * Класс Область
 * Автор: Денис Пономарев
 *
 */

var SokratBalance = function (options){

    SokratBalance.superclass.constructor.call(this,options);

    this.types.type = "balance";
    this.types.dashed = true;
    this.types.ellipse = true;

    this.init();

};

extend( SokratBalance , GraphObject );

mixin(  SokratBalance.prototype, SokratAreaKineticView);

mixin(  SokratBalance.prototype, {

//    init: function(p,d,t){
//        d.circle =  {CREATE: SH.CIRCLE  ,CONNECTOR: 1, ATTRS: [CSS.DASH,{r:p.r}] , DRAG: p.c, UPDATE: p.c ,BLANKET: BL.CIRCLE};
//        d.line =    {CREATE: SH.PATH  , DRAG: p.c , UPDATE:p.c, ATTRS: [CSS.DASH,{path:"M-140,140 140,-140"}]};
//        d.text =    {CREATE: SH.TEXT ,   DRAG: p.pt, BLANKET: BL.RECT, ATTRS: CSS.TEXT, UPDATE: p.pt  };
//    },

    getBbox: function(){
        var p = this.prop;
        return  {x:p.c[0] - p.r,y:p.c[1]-p.r,x2:p.c[0] + p.r,y2:p.c[1] + p.r};
    },



    defaults:{
        pt: [0,0],
        c: [0,0],
        r: 200
    },

    layer: 0,

    inside: function(i,j){
        var p = this.prop;
        if(Math.distance(i,j,p.c[0],p.c[1])>200)return 0;
        if(Math.lowerThanLine(-140 ,140,140,-140,i - p.c[0],j - p.c[1]))return 2;else return 1;
    },


    //todo сделать класс FRAME
    sokratConnection: function(graph,port){

        var port1, pos , i;
        if(graph.group == SOKRAT.GROUPS.POSITIONS || graph.group == SOKRAT.GROUPS.BLOCKS){
            pos = graph.prop.c;
            if(port1 = this.inside(pos[0],pos[1])){
                this.sokrat.connect(this,port1,graph,10);
            }
        }
        if(graph.alias == "area"){
            var oneconnected = false;
            var notconnected = false;
            for( i = 0;i< graph.prop.ps.length;i++ ){
                pos = graph.prop.ps[i];
                if(this.inside(pos[0],pos[1])){
                    oneconnected = true;
                }else{
                    notconnected = true;
                }
            }
            if(!oneconnected)return;
            this.sokrat.connect(this,notconnected? 2:1,graph,10);
        }
        if(graph.group == SOKRAT.GROUPS.ARROWS){
            for( i= 0;i<graph.prop.ps.length; i++){
                if(port == i + 1 || !port){
                    pos = graph.prop.ps[i];
                    if(port1 = this.inside(pos[0],pos[1])){
                        this.sokrat.connect(this,port1,graph,i + 1);
                    }
                }
            }
        }
    },

    alias:"balance",
    group: SOKRAT.GROUPS.FRAMES

});

GRAPH.CLASS["balance"]  = SokratBalance;
