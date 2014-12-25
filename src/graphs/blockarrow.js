
/**
 * Класс Сложная стрелка
 * Автор: Денис Пономарев
 */


var SokratControl = function (options){

    SokratControl.superclass.constructor.call(this,options);

    this.types.type = "line";
    this.types.arrow = true;
    this.types.blocked = true;

    this.init();

};

extend( SokratControl , SokratLine );

mixin(  SokratControl.prototype, SokratAreaKineticView);

mixin(  SokratControl.prototype, {

    alias: "blockarrow",
    group: SOKRAT.GROUPS.ARROWS,
//    init: function(p,d,t){
//
//        for(var i = p.ps.length; i--;){
//            (function addButton(i){
//                d["button"+i] = {
//                    CREATE:     SH.CIRCLE,
//                    UPDATE:     p.ps[i],
//                    BLANKET:    BL.POINT,
//                    STYLE:      "DRAGGER",
//                    DRAG:       p.ps[i],
//                    SET:    function(x,y){
//                                if(i==0){
//                                    p.ps[0] = x;
//                                }
//                                if(i==1){
//                                    p.ps[0] = x;
//                                }
//                            },
//                    GET:    function(){
//                                if(i==0){
//                                    return [p.ps.length==1 ? p.p2[0] : p.ps[0],p.p1[1]];
//                                }
//                                if(i==1){
//                                    return [p.ps[0],p.p2[1]];
//                                }
//                                return [0,0];
//                            }
//                }
//            })(i);
//        };
//
//        t.arrow = true;
//        //todo сделать проверку типов после инициализации
//        if(t.arrow){d.line.ATTRS.push(CSS.ARROW);}
//    },

    defaults: {
        c: [0,0],
        position: [],
//
        ps: [[80,50],[80,70],[90,90]],
        pt: [0,0]
    }


//    update : function(){
//        BlockArrow.superclass.update.call(this);
//
//        var p = this.prop, s = this.shapes;
//
//        var path = ["M", p.p1[0], p.p1[1]];
//
//        var i=0;
//        var hor = (p.a1==2||p.a1==4);
//        if(p.ps.length==1){
//
//            p.ps[0]=p.p2[0];
//            path.push((hor?"H":"V"),p.ps[i]);hor=!hor;
//            this._ms(s["button"+ i],
//                ( hor?   p.p1[0]:     p.ps[i]   )+p.c[0],
//                ( hor?   p.ps[i]   :   p.p1[1]  ) + p.c[1]);
//        }
//        if(p.ps.length==2){
//            p.ps[1]=p.p2[1];
//            path.push((hor?"H":"V"),p.ps[0]);hor=!hor;
//            this._ms(s["button0"], p.ps[0]+p.c[0],p.p1[1]  + p.c[1]);
//            path.push((hor?"H":"V"),p.ps[1]);hor=!hor;
//            this._ms(s["button1"], p.ps[0]+p.c[0],p.p2[1]  + p.c[1]);
//        }
//
//
//
//        if(p.label){
//
//            var middle =  s.line.getPointAtLength(s.line.getTotalLength()/2);
//            s.hint.attr({path:["m",0,0,0,0]});// ["m",middle.x,middle.y ,p.pt[0] ,p.pt[1]]});
//        }
//
//        path.push("L",p.p2[0],p.p2[1]);
//
//        path = Raphael.transformPath(path,["T",p.c[0],p.c[1]]);
//
//
//
//        if(s.blanket){
//            s.blanket.attr({path:path});
//        }
//        s.line.attr({path: path });
//    },
//    layer: 3,
//
//    checkOut : function(a,b){
//        var  p = this.prop.ps, r = this.sokrat.paper;
//        var xEqual = Math.abs(p[a][0] - p[b][0])<30 , yEqual =  Math.abs(p[a][1] - p[b][1])<30;
//
//        if(a==0 && b==1){
//            if(this.prop.a1 == this.prop.a2){
//                var c;
//                if(this.prop.a1 == 2){
//                    c= [ p[a][0] < p[b][0]?  p[b][0] + 50 :  p[a][0] - 50  , p[a][1] ];
//                }
//                if(this.prop.a1 == 4 ){
//                    c= [ p[a][0] > p[b][0]?  p[b][0] + 50 :  p[a][0] - 50  , p[a][1] ];
//                }
//                if(this.prop.a1 == 3 ){
//                    c= [p[a][0],  p[a][1] < p[b][1]?  p[b][1] + 50 :  p[a][1] - 250   ];
//                }
//                if(this.prop.a1 == 1){
//                    c= [p[a][0],  p[a][1] > p[b][1]?  p[b][1] + 50 :  p[a][1] - 50   ];
//                }
//
//                p.splice(2,0,c);
//                var shape = this.addObject2('buttons',2);
//                shape.blanket.data.index=p.length-1;//);// = this.prop.ps.length-1;
//
//                p.len++;
//            }
//        }  else{
//            if(!(xEqual) && !(yEqual)){
//                //var c;
//                // if(this.prop.a1==2 || this.prop.a1==4){
//                var c= [p[a][0],p[b][1]];
//                //  }if(this.prop.a1==1 || this.prop.a1==3){
//                //    c= [p[a][1],p[b][0]];
//                // }
//                p.splice(2,0,c);
//
//                var shape = this.addObject2('buttons',2);
//
//                shape.blanket.data.index = this.prop.ps.length-1;
//                p.len++;
//
//            }else{
//                if(xEqual && a>0  && p[a-1][0] ==  p[b][0]){
//                    p.splice(a,1);
//                    $(this.shapes.buttons[a].node).remove();
//                    this.shapes.buttons.splice(a,1);
//                    //  this.shapes.blankets[p.length-1].index = this.prop.ps.length-1;
//                }
//            }
//        }
//    }
});

GRAPH.CLASS["blockarrow"]  = SokratControl;