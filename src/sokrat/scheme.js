
/**
 * Статическая схема.
 * @author Ponomarev Denis
 */
function Scheme(){

    var defaults = {
        container: null,   // $(dom)
        width: null,
        height: null,
        scale: 0,
        data: null,
        defaults: {},
        labels : true,
//        render: "kinetic",
        padding: 5
    };

    var O = this.init(arguments,defaults);

    this.graphs = {}; //Массив графем на поле

    this.container = typeof O.container =="string" ? document.getElementById(O.container): O.container;

    this.errors = 0;

    this.level = null;

    this.scale = 1;

    this.active = false;

    this.labels = O.labels;

    this.width = O.width || $(O.container).innerWidth();

    this.height = O.height || $(O.container).innerHeight();

    this.padding = O.padding;

    this.xOffset = 0;

    this.yOffset = 0;

    this.relative_properties = [];

    if(O.datasource){
        this.images = O.datasource.images;
    }else{
        this.images = {};
    }

    this.render = new KinetikRender(this);//  new (Scheme.renders[O.render] || Render)(this);

    this.setScale(O.scale);

    if(O.data)this.makedata(O.data);

}


mixin(Scheme.prototype, {
    /**
     * показать схему
     */
    show: function(){this.render.show();},
    /**
     * скрыть схему
     */
    hide: function(){this.render.hide();},

    /**
     * количество графем на схеме
     * @returns int
     */
    length: function(){return $.count(this.graphs);},

    /**
     * Удаление всех графем
     */
    clear: function (){
        for(var i in this.graphs){
            if(i[0]=="-")continue;
            this.remove(this.graphs[i]);
        }
        this.graphs = {};
    },

    /**
     * задать маштаб
     * @param scale number|'auto'
     * @returns {*}
     */
    setScale: function(scale){
        if(scale=='auto' || scale == 0){
            this.scalemode = 'auto';
            this.updateBounds();
        }else{
            this.scalemode = 'static';
            this.scale = scale;
            this.render.scale(scale);
        }
        return this;
    },

    /**
     * Получить граф по его уникальному имени
     * @param name
     */
    getGraphByName: function (name){
        return this.graphs[name];
    },

    /**
     * получить реальный размер схемы
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getBounds: function() {
        var box = { x: Infinity, y: Infinity, x2: -Infinity, y2: - Infinity };

        for(var i in this.graphs){
            var el = this.graphs[i];
            var bbox = el.getBbox ? el.getBbox() : this.render.getBbox(el);
            box.x = Math.min(box.x, bbox.x);
            box.y = Math.min(box.y, bbox.y);
            box.x2 = Math.max(box.x2, bbox.x2);
            box.y2 = Math.max(box.y2, bbox.y2);
        }
        return { x: box.x - this.padding, y: box.y - this.padding, width: box.x2 - box.x + this.padding*2, height:
            box.y2 - box.y + this.padding*2};

    },
    /**
     * изменение размеров
     */
    updateBounds: function(){

        if(!this.length())return {x:0,y:0,x2:0,y2:0};
        if(this.scalemode=='auto'){
            var bbox = this.getBounds();
//            Test Rd Bounds rectangle
//            this.render.graphLayer.add(new Kinetic.Rect({x:bbox.x ,y:bbox.y ,width: bbox.width, height:bbox.height, stroke: "red"}))

            bbox.height += this.padding*2;
            bbox.width  += this.padding*2;

            var scale = Math.min(this.width / bbox.width,this.height / bbox.height );

            this.xOffset = ( - bbox.x )*scale + this.padding+ (this.width - bbox.width*scale)/2;
            this.yOffset = ( - bbox.y)*scale + this.padding+ (this.height - bbox.height*scale)/2;

            this.scale = scale;
            this.render.scale(this.scale);


        }else{
            this.xOffset = 0;
            this.yOffset = 0;
        }

        for(var i = this.relative_properties.length; i--;){
            //todo косяк
            if(typeof this.relative_properties[i][1][1] == "string")
                this.relative_properties[i][2][1] = this.height / this.scale / 100 * parseInt(this.relative_properties[i][1][1]  ) - this.yOffset/ this.scale ;

            if(typeof this.relative_properties[i][1][0] == "string")
                this.relative_properties[i][2][0] = this.width  / this.scale / 100 * parseInt(this.relative_properties[i][1][0]  ) - this.xOffset/ this.scale ;
            this.relative_properties[i][0].kineticUpdate();
        }

        this.render.update();
        return this;

        //return x+ " :" +bbox.width + " : " + y + " : " + scale;
    },

    /**
     * Удаление графемы
     * @param graph
     */
    remove: function (graph){
        for(var port in graph.connections){
            for(var id in graph.connections[port]){
                this.disconnect(graph,port,id);
            }
        }
        this.render.destroy(graph);
        delete this.graphs[graph.name];
        this.onChange && this.onChange();
        this.onDeleteGraph(graph);
    },

    /**
     * функция callback
     * @param graph
     */
    onAddGraph: function(graph){},

    /**
     * функция callback
     * @param graph
     */
    onDeleteGraph: function(graph){},

    /**
     * сбор данных о графеме
     * @param name
     * @returns {*[]}
     */
    getData: function(name){
        var g = this.graphs[name];

        //Сборка массива соеднинений графемы
        var cns2={};
        for(var port in g.connections){
            if(/*g.cdata[port]!=CT.OWNER && */ !$.isEmptyObject(g.connections[port])){
                for(var gr in g.connections[port]){
                    var c = g.connections[port][gr];
                    if(!cns2[port])cns2[port]=[];
                    cns2[port].push([c[0].name,parseInt(c[1])]);
                }
            }
        }
        //сборкамассива свойств графемы
        var props = {};
        for(var prop in g.prop){
            //TODO убрать параметры по умолчанию
            //if(!g.def[prop] ||  $.toJSON(g.prop[prop])!= $.toJSON(g.def[prop])){

//            if(g.get[prop]){
//                var value = g.get[prop].call(g);
//            }else{
//                if($.isArray(g.prop[prop]) && g.prop[prop].length ==2){
//                    if($.isArray(g.prop[prop]) && g.prop[prop].length ==2){
//
//
//                    }
//                    value = [parseInt(g.prop[prop][0]),parseInt(g.prop[prop][1])];
//                }else{
                   var value = g.prop[prop];
//                }
//            }

            //todo уаление лишних свойств
            if($.isNumeric(g.gsense)){
                var sameAsRule    = this.level.graphs[g.gsense][prop]!=undefined ? this.level.graphs[g.gsense][prop].toString() == value.toString() : false;
            }
            var sameAsDefault = g.defaults[prop]!=undefined ? g.defaults[prop].toString() == value.toString() : false;
            if( prop == "label" ||sameAsRule || sameAsDefault )continue;

            props[prop] = value;

        }
        return [g.sense,g.gsense,props,cns2];
    },
    /**
     * сбор данных о графемах
     * @return object {graph_name: [label, graph, properties, connections]}
     */
    getGraphData: function(){
        //инициализация _all_graphs
        var _all_graphs = {};
        for(var i in this.graphs){
            _all_graphs[i] = this.getData(i);
        }
        return _all_graphs;
    },

    /**
     * todo олучить граф, в указанной точке
     * @param x
     * @param y
     */
    getGraphByPoint: function(x,y){
        for(var i in this.graphs){
            var port = this.graphs[i].inside(x,y);
            if(port)alert(port);
        }
    }



});




Scheme.prototype.init = function(arguments,defaults){
    if(arguments.length==1){
        var O =arguments[0];
        if(typeof O.container=='string')O.container = document.getElementById(O.container);

        if(O.container){
            O.height = O.height||O.width|| $(O.container).height();
            O.width  = O.width|| $(O.container).width();
        }
        O = $.extend(defaults, O);
    }else{
        console.log(" sceheme init error");
    }
   // if(O.width)$(O.container).width(O.width);else O.width = $(O.container).width();
   // if(O.height)$(O.container).height(O.height);else O.height = $(O.container).height();
    return O;
};


/**
 * конструкция  defaults применяется ко всем послеующим формам
 * {defaults:true, fill: white,... }
 * @param data
 */
Scheme.prototype.makedata = function (data){
    var defaults = {fill:"black"};
    var S = this;
    var set = [];
    var _active = this.active;
    if(data.active !=undefined && !data.active)this.active = false;

    function create(options){
        if(options.defaults){
            delete options.defaults;
            $.extend(defaults,options);
            return false;
        }else if(options.shape){
            var shape = S.render.createShape(options.shape);
            if(!shape){alert("Ошибка: Формы "+ options.shape + " не существует!"); return false;}
        //    if(options.layer && !S.layers[options.layer])S.layers[options.layer] = S.paper.group();
        //    S.layers[options.layer||0].push(shape);

            if(S.render.type=="raphael"){
                S.render.layers[0].push(shape);
                delete options.shape;
                delete options.layer;
                shape.attr(defaults);
                shape.attr(options);
            }else{
                S.render.graphLayer.add(shape);
                S.render.stage.draw();
            }

            var graph = new GraphObject();
            graph.shapes.first = shape;
            //alert(options);
            S.graphs[S.getAvailableName(options)] = graph;

        }else if(options.load){

            function loaddata(data){

                options.width = options.width || $(S.container).width();
                options.height = options.height || $(S.container).height();
                options.x = options.x || 0;
                options.y = options.y || 0;

                var xOffset = options.x, yOffset = options.y;
                if(options.align == 'center'){
                    xOffset -= options.width/2;
                    yOffset -= options.height/2;
                }

                for(var i=0; i< data.length; i++){
                    create(data[i]);
                }
            }

            if(typeof options.load == 'string' ){
                API.scheme_load(options.load,function(data){
                    loaddata(data);
                });
            }else{
                loaddata(options.load);
            }

        }else{
            var graph = S.graph(options);

            if(!graph){
                alert("graph is not created :  " + JSON.stringify(options));
                return;
//                S.showError({type: "nograph",graph:options.graph });
            }

            S.render.createGraphElement(graph);

            S.graphs[S.getAvailableName(options)] = graph;
        }
    }

    var sch= false;
    if(typeof data == 'object'){
        if(data.length != undefined){
            for(var i=0; i< data.length; i++){
                create(data[i]);
            }
        }else{
            create(data);
        }
    }else{
        create({graph: data});
    }
    this.updateBounds();
    this.active = _active;
};

/**
 * получить уникальное имя для графемы
 * @param options
 * @returns {*|string}
 */
Scheme.prototype.getAvailableName =  function(options){
    var name =  options.name  || options.graph || "--";
    if(this.getGraphByName(name) || !options.name){
        var i=1;
        while(this.getGraphByName(name + i)){ i++;}
        name += i;
    }
    return name;
};

/**
 * создать графему
 * @param opt
 * @returns {*}
 */
Scheme.prototype.graph = function(opt){
    var options = $.extend(true,{},opt);

    if(options.graph.indexOf("-")!=-1){
        options.type = (options.type?options.type+"-":"")+ options.graph.substring(options.graph.indexOf("-")+1);
        options.graph = options.graph.substring(0,options.graph.indexOf("-"));
    }

    if(!GRAPH.CLASS[options.graph.toLowerCase()])return null;//throw "noGraph";
    if(typeof GRAPH.CLASS[options.graph.toLowerCase()] != 'function'){
        var arr =GRAPH.CLASS[options.graph.toLowerCase()];
        //псевдоним
        for(var i in arr){ options[i] = arr[i];}
        return this.graph(options);
    }

    if(this.labels == false) options.label = "";

    options.name = this.getAvailableName(options);


    if(SOKRAT.settings.debug)  options.label = "("+options.name+")";

    //создать объект /// не унаследет предоков больше первого порядка косяк/
    var graph = new GRAPH.CLASS[options.graph](options);
    graph.name = options.name;

    //операции выполняемые после основного конструктора
//    graph.getAttrs(options);

    graph.sokrat = this;

    return graph;
};

Scheme.renders = {};

Scheme.update = function(el){
    var els = el ? el.find("scheme")  : $("scheme");
    els.each(function(){
        this.scheme = Scheme.create(this);
        $(this).trigger("create");
    });
};

/**
 * CSS свойства наследуются формами
 *  color <css> = fill <svg>
 * @param container
 */
Scheme.create = function(container){

    var html =$(container).text().replace(/^\s+/, "").replace(/\s+$/, "");
    if(html=="")return;
    if(html[0] == "{" || html[html.length-1] == "}")
        var data = eval("["+html+"]");
    else{
        data = html;
    }
   // if($(container).find('svg').length==0)

   var defaults = {};
    if(container.style.color)
        defaults.fill =  container.style.color;
    if(container.style["border-color"])
        defaults.stroke =  container.style["border-color"];

    if(defaults)


    $(container).empty();
        return new Scheme({
            data: data,
            container: container,
            scale: $(container).attr("scale"),
            width: $(container).width(),
            height: $(container).height()
        });
};


//Доступные формы для графем
var SH = {
    PATH:    "path",
    TEXT:    "text",
    CIRCLE:  "circle",
    RECT:    "rect",
    ELLIPSE: "ellipse",
    MAN:     "man",
    IMAGE:   "image"
};