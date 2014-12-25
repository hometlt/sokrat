
/*----------------------------------------------------------------------------------------------------------------------
 * Смысловой фокус
 *--------------------------------------------------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------------------------------------------------
 * Позиция
 *--------------------------------------------------------------------------------------------------------------------*/



var SokratPosition = function (options){
    SokratPosition.superclass.constructor.call(this,options);
    this.types.type = "man";
    this.types.ellipse = true;


    this.init();
};

extend(SokratPosition , SokratBlock );
mixin( SokratPosition.prototype, SokratAreaKineticView);
mixin( SokratPosition.prototype, {


    alias:"position",
    group: SOKRAT.GROUPS.POSITIONS,


    getBbox: function(){
        var p = this.prop;
        return  {x: p.c[0] - p.w/2,y:p.c[1] - p.h/2,x2:p.c[0] + p.w/2,y2:p.c[1] + p.h/2};
    },

    inside: function(x,y){
        return Math.distance(x,y,this.prop.c[0],this.prop.c[1]) < this.prop.w/2 ? 1: 0;
    },


    onConnect: function(port1,graph2,port2){

        if(port1 == 10 && graph2.group != SOKRAT.GROUPS.FRAMES){
            if(!this.selected)this.setState(GRAPH.STATE_CONNECTED);
            this._drag_connected = true;
        }

    },

    onDisconnect: function(port1,graph2,port2){
        if(port1 == 10 && graph2.group != SOKRAT.GROUPS.FRAMES){
            if(!this.selected)this.setState(GRAPH.STATE_DEFAULT);
            this._drag_connected = false;
        }
    },

//    init: function(p,d,t){
//        t.ellipse = true;
//
//        d.block.CREATE = SH.CIRCLE;
//        d.block.ATTRS = [{r: p.w/2}];
//
//        d.man  = {CREATE: SH.MAN, UPDATE: p.c, STYLE: "BLACK"};
//
//
//       // alert($.toJSON(p.func ? CSS.BLOCK : CSS.INV));
//
//        if(t.func){
//            d.block.ATTRS.push( CSS.BLOCK);
//        } else{
//            delete d.block.STYLE;
//            d.block.ATTRS.push( CSS.INV);
//        }
//
//        if(p.reflex){
//            d.reflex ={UPDATE: p.c, ATTRS: CSS.BLACK , CREATE: function(paper,p){
//                var star = "m -9.9265494,0.30246005 c 0.4740924,-1.46350255 0.9481847,-2.92700505 1.4222771,-4.39050755 2.4292958,0.8737686 4.8733837,1.7539887 7.1423046,2.9991495 -0.2560106,-2.5614683 -0.5417954,-5.1241446 -0.6183814,-7.6988478 1.4944216,0 2.9888432,0 4.4832648,0 -0.085631,2.5674208 -0.01933,4.9430488 -0.3566189,7.4880359 2.3477627,-1.1832163 4.4485121,-1.9616819 6.9423803,-2.7883376 0.4740923,1.4635025 0.9481849,2.927005 1.4222769,4.39050755 C 8.0099986,1.1298718 5.4307595,1.7337353 2.8121064,2.0339278 4.7729833,3.80042 6.450713,5.8496746 8.130186,7.8776316 6.8934233,8.7536717 5.6566606,9.6297119 4.4198979,10.505752 2.872271,8.3797571 1.5087205,6.127492 0.18398566,3.8581528 -1.0286679,6.146336 -2.2868871,8.4240482 -3.8354931,10.505752 c -1.21615,-0.8760401 -2.4323,-1.7520803 -3.64845,-2.6281204 1.6490472,-1.9994031 3.266609,-4.0389424 5.1325652,-5.8437038 C -4.894647,1.5409196 -7.4235536,0.97122559 -9.9265494,0.30246005 z";
//                var path="";
//                for(var i=0;i<p.reflex;i++){
//                    path +=Raphael.transformPath(star,['T', (i+1)*25,-30]);
//                }
//                return paper.path(path);
//            }};
//        }
//    },

    update: function(){
        var p = this.prop;
        if(p.label){
            this._ms(this.shapes.text, p.c[0] , p.c[1] - p.h/2 - 15);
        }
    },



    defaults: {
        w : 80,
        h : 80,
        reflex: 0,
        c: [0,0],
        ports: false
    }
});

GRAPH.CLASS["position"]  = SokratPosition;
