/**
 * Класс Блок
 * Автор: Пономарев Денис
 * Date: 16.03.12
 */




var SokratBlock = function (options){

    SokratBlock.superclass.constructor.call(this,options);

    this.types.type = "rect";



    if(this.types.ellipse){
        this.types.type = "circle";
        this.types.ellipse = true;
    }
    if(this.types.skew){
        this.types.type = "skew";
    }
    if(this.types.condition){
        this.types.type = "condition";
    }

//    if(this.prop.image){
//        this.types.type = "image";
//    }
    this.init();

};

extend( SokratBlock , GraphObject );

mixin(  SokratBlock.prototype, SokratAreaKineticView);

mixin(  SokratBlock.prototype, {

    alias: "block",
    group: SOKRAT.GROUPS.BLOCKS,


    getBbox: function(){
        var p = this.prop;
        return  {x: p.c[0] - p.w/2,y:p.c[1] - p.h/2,x2:p.c[0] + p.w/2,y2:p.c[1] + p.h/2};
    },
//
//    render: function (){
//        var p = this.prop;
//
//        SokratRender.roundRect(this.sokrat.context, p.c[0], p.c[1], p.w, p.h, 5, p.label,"--","middle");
//    },

    inside: function(x,y){
//        if(this.sokrat.render.stage)if(!this.shapes.rect.intersects([pos[0] ,pos[1]]))
//          if(!this.shapes.block.isPointInside(pos[0]- this.prop.c[0] ,pos[1] - this.prop.c[1]))
        var p = this.prop;
        if(Math.abs( p.c[0] - x ) < p.w/2 && Math.abs( p.c[1] - y ) < p.h/2)return 1;
        return 0;
//        if(Math.sqrt( Math.pow(this.prop.c[0] - x,2)  +  Math.pow(this.prop.c[1] - y,2) ) < this.prop.w ){
//            return 1;
//        }
    },

    layer: 1,

    defaults: {
        c: [0,0],
        h: 80,
        w: 80,
        ports: false,
        label: null,
        image: null,
        type: null
    },

    update: function(){
        var p = this.prop;
        if(p.label){
            this._ms(this.shapes.text, p.c[0] , p.c[1]);
        }
    },

    sokratConnection: function(graph,port){

        if(this.group == SOKRAT.GROUPS.BLOCKS && graph.group == SOKRAT.GROUPS.POSITIONS){
            pos = graph.prop.c;
            var port1 = this.inside(pos[0],pos[1]);
            if(port1){
                this.sokrat.connect(this,port1,graph,10);
            }
        }

        if(graph.group == SOKRAT.GROUPS.ARROWS){
        //если подключена стрелка определяем свойство с которым будем работать

            if(!port || port==10){
                this.sokratConnection(graph,1);
                this.sokratConnection(graph,2);
                return;
            }

            var _c = $.count(graph.connections[port]);
            if(_c > 0)return;

            var pos = graph.getPoint(port);
            if(!this.inside(pos[0],pos[1]))return false;

            //опредлеям порт и соединяем графему
            if(!this.prop.ports){
                this.sokrat.connect(this,1,graph,port);
            }else{
                this.sokrat.connect(this,this.getSubPort(pos),graph,port);
            }
        }
    },




    onMove: function(port){
        this.updateConnection();
    },


    updateConnectionEasy: function(dx,dy){
        var pos, arrows,graph , port1,port2 , i;
        for(port1 = 5;port1-- ;){
            arrows = this.connections[port1];
            for(i in arrows){
                graph =  arrows[i][0];
                port2 =  arrows[i][1];
                if(graph.group == SOKRAT.GROUPS.ARROWS){
                    pos = graph.prop.ps[port2 - 1];
                }else{
                    pos = graph.prop.c;
                }
                pos[0] += dx;
                pos[1] += dy;
                graph.updateConnection();
                this.sokrat.render.updateGraph(graph,port2);
            }
        }
    },

    getSubPort: function(pos){
         var x = ( - this.prop.c[0] + pos[0]) / this.prop.w,
         y = (this.prop.c[1] - pos[1]) / this.prop.h ;

        return  (x>0)?
            (y > 0 ? ( x > y ? 2 : 1 ) : ( x > -y ? 2 : 3 )):
            (y > 0 ? ( -x > y? 4 : 1 ) : ( -x > -y ? 4 : 3 ));
    },

    updateConnection: function(){

        var self =this;
        var p = this.prop;


        if(this.types.ellipse == true){

            var arrows = this.connections[1];


            var xradians  =  Math.toRadians( 15 );

            var angles = [];

            for(var i in arrows){

                var graph = arrows[i][0], port =  arrows[i][1];

                if(graph.group != SOKRAT.GROUPS.ARROWS)continue;

//                var  p1 = graph.prop.ps[0], p2 = graph.prop.ps[1];


                var ps = graph.prop.ps;
                var anotherProperty;

                if(port == 1){
                    anotherProperty = ps[1];
                }else{
                    anotherProperty = ps[port - 2];
                }

                var x1 = this.prop.c[0], y1 =  this.prop.c[1];


                var _ag = null;
                if(!graph.prop.middle && ps.length == 2){
                    //изменение другой точчки графемы
                    var _acs = graph.connections[port == 1 ? 2: 1],x2,y2;

                    if(_acs && $.count(_acs)>0){
                        _ag = _acs[$.firstkey(_acs)][0];
                    }
                }

                if(_ag && _ag.types.ellipse){
                    x2 =  _ag.prop.c[0];
                    y2 =  _ag.prop.c[1];
                }else{
                    x2 = anotherProperty[0];
                    y2 = anotherProperty[1];
                }

                var dx = x2 - x1;
                var dy = y2 - y1;


                var angle = Math.getAngle(dx,dy);
//отдаление  стрелок друг от друга (работает некрасиво)
                var jj = 0;
                for(var j in angles){
                    if(Math.abs(angles[j] - angle ) < 20){
                        jj++;
                    }
                }

                var radians  = Math.toRadians( angle );
                var newx = x1 + this.prop.w / 2 * Math.cos( radians + jj*xradians );
                var newy = y1 + this.prop.w / 2 * Math.sin( radians + jj*xradians );
                graph.setPoint(port,newx, newy );

                angles.push(angle);

                if( _ag && _ag.types.ellipse   ){
                    graph.setPoint( port == 1 ? 2 : port - 1,
                        x2 - _ag.prop.w / 2 * Math.cos( radians - jj*xradians),
                        y2 - _ag.prop.w / 2 * Math.sin( radians- jj*xradians) );
                }
                this.sokrat.render.updateGraph(graph);



            }



        }else{
            for(var port1 =1;port1<=4 ;port1++){


                var x= p.c[0], y=p.c[1];
                if(port1 == 2) x += p.w/2;
                if(port1 == 4) x -= p.w/2;
                if(port1 == 1) y -= p.h/2;
                if(port1 == 3) y += p.h/2;

                var arrows = this.connections[port1];

                if(!this.prop.ports){


                    if(this.types.ellipse)return false;

                    var counter=[0,0,0,0];
                    var allcount=[0,0,0,0];
                    for(var i in arrows){
                        var graph =  arrows[i][0];
                        if(graph.group != SOKRAT.GROUPS.ARROWS)continue;

                        var port  = this.getSubPort(graph.getPoint(arrows[i][1]));

                        allcount[port-1]++;

                    }
                    for(var i in arrows){
                        var graph =  arrows[i][0];

                        if(graph.group != SOKRAT.GROUPS.ARROWS)continue;
                        var object = graph.connectors[arrows[i][1]];

                        var port  = this.getSubPort(graph.getPoint(arrows[i][1]));

                        var x= p.c[0], y=p.c[1];
                        if(port == 2) x += p.w/2;
                        if(port == 4) x -= p.w/2;
                        if(port == 1) y -= p.h/2;
                        if(port == 3) y += p.h/2;

                        var cx, cy;
                        if(port==4 || port == 2){
                            cx = x - graph.prop.c[0];
                            cy =  y-p.h/2 + p.h/(allcount[port-1]+1)*(1+counter[port-1])- graph.prop.c[1];
                        }else{
                            cx = x - p.w/2 + p.w/(allcount[port-1]+1)*(1+counter[port-1])- graph.prop.c[0];
                            cy =  y - graph.prop.c[1];
                        }


                        var pos = graph.prop.ps[arrows[i][1]-1];

                        pos[0] = cx;
                        pos[1] = cy;
                        this.sokrat.render.updateGraph(graph);

                        counter[port-1]++;
                    }
                    return;

                }


                if(port1 == 2|| port1 == 4 ) {
                    /*
                     function vSort(a, b) {
                     var an1 = a[0].angle();//  Math.getAngle(a[2].prop[a[3]==1?'p2':'p1'][0] - p.c[0] - a[2].prop.c[0], a[2].prop[a[3]==1?'p2':'p1'][1] - p.c[1] -  a[2].prop.c[1]);
                     var an2 = b[0].angle();//Math.getAngle(b[2].prop[b[3]==1?'p2':'p1'][0] - p.c[0] - a[2].prop.c[0], b[2].prop[b[3]==1?'p2':'p1'][1] - p.c[1] -  a[2].prop.c[1]);
                     if(a[1]==1)an1+=180;
                     if(b[1]==1)an2+=180;

                     if(port1==4){
                     if(an1<90)an1+=360;
                     if(an2<90)an2+=360;
                     }

                     if(port1==2){
                     if(an1>360)an1-=360;
                     if(an2>360)an2-=360;
                     }

                     a[0].prop.label=parseInt(an1); a[0].updateLabel();
                     b[0].prop.label=parseInt(an2); b[0].updateLabel();

                     return   (port1 == 4?an1 >an2 : an1<an2) ? -1:1;
                     }
                     arrows.sort(vSort);*/

                    var counter=0;
                    for(var i in arrows){
                        var graph =  arrows[i][0];

                        var port2 =  arrows[i][1];

                        if(graph.group != SOKRAT.GROUPS.ARROWS)continue;
                        var drag = graph.connectors[arrows[i][1]];
                        //поиск переещаемого визуального объекта
                        var cx= x - graph.prop.c[0], cy =  y-p.h/2 + p.h/($.count(arrows)+1)*(1+counter)- graph.prop.c[1];



                        var pos = graph.prop.ps[arrows[i][1]-1];

                        pos[0] = cx;
                        pos[1] = cy;
                        this.sokrat.render.updateGraph(graph);
                        counter++;
                    }
                }

                if(port1 == 1|| port1 == 3){
                    /* function hSort(a, b) {
                     var an1 = a[0].angle();// Math.getAngle(a[2].prop[a[3]==1?'p2':'p1'][0] - p.c[0] -  a[2].prop.c[0] , a[2].prop[a[3]==1?'p2':'p1'][1] - p.c[1] -  a[2].prop.c[1]);
                     var an2 = b[0].angle(); //Math.getAngle(b[2].prop[b[3]==1?'p2':'p1'][0] - p.c[0] -  a[2].prop.c[0] , b[2].prop[b[3]==1?'p2':'p1'][1] - p.c[1] -  a[2].prop.c[1]);

                     if(a[1]==1)an1+=180;
                     if(b[1]==1)an2+=180;

                     if(port1==3){

                     if(an1<90)an1+=360;
                     if(an2<90)an2+=360;
                     }

                     if(port1==1){

                     if(an1>360)an1-=360;
                     if(an2>360)an2-=360;
                     }

                     a[0].prop.label=parseInt(an1); a[0].updateLabel();
                     b[0].prop.label=parseInt(an2); b[0].updateLabel();

                     return  (port1 == 1?an1 <an2 : an1>an2) ? -1:1;
                     }
                     //arrows.sort(hSort);*/


                    var counter=0;
                    for( var i in arrows){

                        var graph =  arrows[i][0];

                        var port2 =  arrows[i][1];

                        if(graph.group != SOKRAT.GROUPS.ARROWS)continue;

                        var pos = graph.prop.ps[arrows[i][1]-1];

                        pos[0] = x-p.w/2 + p.w/($.count(arrows)+1)*(1+counter)- graph.prop.c[0];
                        pos[1] = y - graph.prop.c[1];
                        this.sokrat.render.updateGraph(graph);

                        counter++;
                    }
                }
            }
        }
    }
});

GRAPH.CLASS["block"]  = SokratBlock;



GRAPH.CLASS["ellipse"] = {graph:"block",ports:false,type: 'ellipse'};
GRAPH.CLASS["skew"]    = {graph:"block-skew"};
GRAPH.CLASS["focus"]   = {graph:"block",type: 'ellipse'};