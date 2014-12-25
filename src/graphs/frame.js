/**
 * Класс Рамка
 * Автор: Денис Пономарев
 *
 */



var SokratFrame = function (options){

    SokratFrame.superclass.constructor.call(this,options);

    this.types.type = "frame";
    this.prop._tmp1 = [30,30];
    this.prop._tmp2 = [30,30];

    this.init();
//
};

extend( SokratFrame , GraphObject );

mixin(  SokratFrame.prototype, SokratAreaKineticView);

mixin(  SokratFrame.prototype, {

    alias: "frame",
    group: SOKRAT.GROUPS.FRAMES,

    defaults :  {
        c: [0,0],
        l:  150,
        ps: [[-30,-30],[30,30]],
        pt: [0,0]
    },

    getBbox: function(){

        var box = { x: Infinity, y: Infinity, x2: -Infinity, y2: - Infinity };
        this.bboxCorrect(box,this.prop.ps[0]);
        this.bboxCorrect(box,this.prop.ps[1]);
        this.bboxCorrect(box,this.prop._tmp1);
        this.bboxCorrect(box,this.prop._tmp2);

        return box;
    },

    inside: function(x,y){
        var p = this.transformPoint([x,y]);
        var fillenabled = this.shapes.area.getFillEnabled();
        this.shapes.area.enableFill();
        var inside  = this.shapes.area.intersects(p[0],p[1]) ? 1: 0;
        this.shapes.area.setFillEnabled(fillenabled);
        return inside;
    }



    /*
    init: function(p,d,t){
        d.drag3 =   {CREATE: SH.RECT , DISCONNECT: [1], DRAG:p.c , ATTRS: [CSS.INV,{height:20}]};
        d.drag4 =   {CREATE: SH.RECT ,DISCONNECT: [1],
            SET: function(x,y){
                var _l = Math.distanceToLine(p.p1[0]+ p.c[0],p.p1[1]+ p.c[1],p.p2[0]+ p.c[0],p.p2[1]+ p.c[1],event.x,event.y);
                p.l = _l > 20 ? _l : 20;
            },
            GET: function(){return [0,0];},
            ATTRS: [CSS.INV,{height:20}]
        };
        d.line  =   {CREATE: SH.PATH, STYLE: "LINE", DRAG: p.c,DISCONNECT: [1], CONNECTOR: 1 };


        d.field =   {CREATE: SH.PATH, ATTRS: CSS.DASH };
        d.text = {CREATE: SH.TEXT ,   DRAG: p.pt, BLANKET: BL.RECT, ATTRS: CSS.TEXT  };
        d.hint = {CREATE: SH.PATH };


        d.drag1= { CREATE: SH.CIRCLE, DRAG: p.p1, UPDATE: p.p1,DISCONNECT: [1], BLANKET: BL.POINT, STYLE: "DRAGGER"};
        d.drag2= { CREATE: SH.CIRCLE, DRAG: p.p2 ,UPDATE: p.p2,DISCONNECT: [1], BLANKET: BL.POINT, STYLE: "DRAGGER"};
    },

    inside: function(x,y){
        return this.shapes.field.isPointInside(x ,y)?1:0;
    },

    update: function(){
        SokratFrame.superclass.update.call(this);

        var p = this.prop, s = this.shapes,
            p_angle = Math.getAngle(p.p2[0] - p.p1[0] , p.p2[1] - p.p1[1] ),
            p_cx = (p.p1[0]+p.p2[0])/2 + p.c[0],
            p_cy = (p.p1[1]+p.p2[1])/2 + p.c[1],
            p_len = Math.distance( p.p1[0],p.p1[1],p.p2[0], p.p2[1] );

        var rad = Raphael.rad(p_angle +90);
        var lx = Math.cos(rad)*p.l;
        var ly = Math.sin(rad)*p.l,
            x2 =p.c[0]+p.p2[0],
            y2= p.c[1] +p.p2[1],
            x1 = p.c[0]+ p.p1[0],
            y1 = p.c[1]+  p.p1[1];


        this.prop.p3 = [x2+lx, y2+ly];
        this.prop.p4 = [x1+lx, y1+ly];

        this._ms(this.shapes.text, p_cx +p.pt[0] , p_cy + p.pt[1]);
        s.hint.attr({path: ["m",p_cx,p_cy ,p.pt[0] ,p.pt[1]]});
        s.field.attr({path:["M",x1, y1, x2, y2, x2+lx, y2+ly, x1+lx, y1+ly , "z"]});

        s.drag3.transform(['T',p_cx,p_cy,'R',p_angle,p_cx,p_cy]).attr({width:p_len, x: -p_len/2});
        s.drag4.transform(['T',p_cx,p_cy,'R',p_angle,p_cx,p_cy]).attr({width:p_len, x: -p_len/2,y: p.l - 10});
        s.line.transform( ['T',p_cx,p_cy,'R',p_angle,p_cx,p_cy]).attr({path:["M",-p_len/2,40,"V",0,"H",p_len/2,"V",40,"M",50,50]});
    }*/
});

GRAPH.CLASS["frame"]  = SokratFrame;
