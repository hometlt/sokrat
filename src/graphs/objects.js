

    
    
    
/**
 * основной класс графемы
 * @param name
 */

var GRAPH={
    CLASS: {},

    STATE_DEFAULT: "default",
    STATE_CONNECTED: "connected",
    STATE_SElECTED: "selected"
};

function GraphObject(options){
    if(!options)options={};

    this.prop = {};
    if(this.defaults){
        var defaults = $.extend(true,{},this.defaults);
        var defaults = $.extend(defaults ,options);
        for(var prop in defaults){
            if(options[prop] != undefined){

                if(prop == "c" || prop == "pt"){
                    this.prop[prop] = [options[prop][0], options[prop][1]];
                }else if (prop == "ps") {

                    this.prop[prop] = [];
                    for(var i = 0 ;  i< options[prop].length;i++){
                        this.prop[prop][i] = [ options[prop][i][0], options[prop][i][1]];
                    }
                }else{
                    this.prop[prop] = options[prop];
                }
            }else if(defaults[prop]!=null){

                if(prop == "c" || prop == "pt"){
                    this.prop[prop] = [defaults[prop][0], defaults[prop][1]];
                }else if (prop == "ps") {

                    this.prop[prop] = [];
                    for(var i = 0 ;  i< defaults[prop].length;i++){
                        this.prop[prop][i] = [ defaults[prop][i][0], defaults[prop][i][1]];
                    }
                }else{
                    this.prop[prop] = defaults[prop];
                }

            }
        }
    }else{
        this.prop = $.extend(true, {}, options);
    }

    this.prop.label = options.label ||"";

    this._not_connectable = options._not_connectable || false;
    this.active = options.active !=undefined ? options.active: true;

    if(options.attrs) this.prop.attrs = options.attrs;


    var keynum=0;
    var keys = Object.keys(defaults);

    this.types = {};
    if(options.type){
        var props = options.type.split("-");
        for (var i =0; i<props.length;i++){
            if (/\d/.test(props[i][0])){
                var value = true;
                var typename = props[i].replace(/^\d+/,function(a){value =  a ;return "";});


                if(!typename){
                    if(keynum >= keys.length)continue;
                    typename = keys[keynum];
                    keynum++;
                }

                if(defaults[typename] != undefined){
                    this.prop[typename] = value;
                }


            }else{
                typename =  props[i];
                value = true;
                if(defaults[typename]!=undefined)this.prop[typename] = value;
                this.types[typename] = true;
            }
        }
    }


    $.extend(this, {

        //свойства фигур
        data: {},

        //Все фигуры
        shapes: {},

        //Объекты, к которым можно присоеденять другие объекты
        connectors: {},

        //Соединения входящие (на каждый порт) [graph1,port1];
        connections: {1:{}},

        //Мышь над графемой
        hover: false,

        //графемы выделена
        selected: false,

        sokrat: undefined,

        paper: undefined,

        set: {}

    });



    this.data.drag0 = {
        disconnect: [10]
    };

}mixin(GraphObject.prototype, {


    defaults: {},

    shapes: {},

    setPoint: function(index,x,y){
        var prop = index? this.prop.ps[--index] : this.prop.c;

        if(!$.isNumeric(x) || !$.isNumeric(y)){
            yy.yy();
        }
        prop[0] = x;
        prop[1] = y;
    },

    getPoint: function(index){

        var x =0,y =0;

        if(index == 10){
            var _ps , i = 0;
            if(this.prop.ps){
                while(_ps = this.prop.ps[i++]){
                    x += _ps[0];
                    y += _ps[1];
                }
                x /= this.prop.ps.length;
                y /= this.prop.ps.length;
                return [x,y];
            }else{
                var prop = this.prop.c;
            }
        }else if(index && this.prop.ps[index - 1]){
            var prop = this.prop.ps[index - 1];
        }else{
            var prop = this.prop.c;
        }
//        if(isNaN(x))x.x();
        return prop.copy();
     },


    transformPoint: function (p){
        p[0] = p[0]  * this.sokrat.scale + this.sokrat.xOffset;
        p[1] = p[1]  * this.sokrat.scale + this.sokrat.yOffset;
        return p;
    },

    /**
     * переотрисовка графемы
     */
    update: function(){
    },
    getLabel: function(){

        if(!this.prop.label)return "";

        var label;
        if(this.prop.label == "?name"){
            label = this.name;
        }else{
            label = this.prop.label;
        }
        return label; //todo
    },

    updateConnection:  function(){},

    unselect: function (){
        this.selected = false;
        this.sokrat.render.unselect(this);
    },

    select: function() {
        this.selected = true;
        this.sokrat.render.select(this);
    },


    bboxCorrect : function(box,pos){
        //если свойство относительное (указано в %) то никаки не изменять bbox
        for(var i = this.sokrat.relative_properties.length;i--;){
            if(this.sokrat.relative_properties[i][2] == pos)return;
        }
        box.x = Math.min(box.x, pos[0]);
        box.y = Math.min(box.y, pos[1]);
        box.x2 = Math.max(box.x2, pos[0]);
        box.y2 = Math.max(box.y2, pos[1]);
    },


    dragMove: null, //function(dx,dy,x,y,cx,cy)

    /**
     * действие при перемещении гарфемы
     * @param port
     */
    onMove: function(port){},

    /**
     * действие при установке графемы
     * @param port - тип перемещения (например 1 - при переносе стрелки за начало, 2 - за конец)
     */

    onDrop: function(port){
        var p =this.prop;
        if(port == 10 && p.ps){
            for(var i=0;i<p.ps.length;i++){
                p.ps[i][0] +=p.c[0];
                p.ps[i][1] +=p.c[1];
            }
            p.c[0] = 0;
            p.c[1] = 0;
        }
    },


    //todo сделать класс FRAME
    sokratConnection: function(graph,port){

        var port1, pos , i;
        if(graph.group == SOKRAT.GROUPS.POSITIONS || graph.group == SOKRAT.GROUPS.BLOCKS){
            pos = graph.getPoint(0);
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
            for( i= 1;i<=graph.prop.ps.length; i++){
                if(port == i || !port){
                    pos = graph.getPoint(i);
                    if(port1 = this.inside(pos[0],pos[1])){
                        this.sokrat.connect(this,port1,graph,i);
                    }
                }
            }
        }

    },

    getData: function(index) {
        for(var i in this.data){
            if(this.data[i].CONNECTOR && this.data[i].CONNECTOR == index)return this.shapes[i];
        }
        return 0;
    }
});


