/**
 * Sokrat Engine
 * @author Ponomarev Denis
 */



//статический объект
var SOKRAT = {

    settings : {debug : false},
    // в продакшен версии удалить вывод в консоль
    debug: function(msg){
//            var text = "";
//            if(!/^API/.test(a))return;
//            for(var i =0; i< arguments.length;i++){
//                console.log ( arguments[i]);
//                    typeof arguments[i]!='string'?
//                    $.toJSON(arguments[i])
//                    // $.toArrayFormat(arguments[i],3)
//                    :
//                    arguments[i] ) + ";";
//           }
    },

    /**
     * способы отрисовки графа
     *
     * KinteticJS - Supports IE9 + , all modern browsers
     *
     * RaphaelJS - Supports IE6 + (сейчас отключен)
     */
    RENDERS: {},

    DISABLE_ANIMATIONS: false,

// Предустановленные группы графем
    GROUPS:  {ARROWS:"arrows",BLOCKS:"blocks", FRAMES: "frames", POSITIONS: "positions"},
// загруженные изображения
    IMAGES: {},
    /**
     * получить полный список графем на схеме
     * функция соотносит идентификатор типа графемы со спецификацией
     * @param specification  спецификации графем.
     * @param graphs данные о графемах (тип графемы, смысл, свойства)
     * @returns {*}
     */
    getGraphArray: function(specification,graphs){
        var l_graphs = graphs;
        for(var i in graphs){
            var g = graphs[i];
            var data = specification[g[1]]; // API.loadedLevel.graphs[g[1]];

            l_graphs[i] = {
                prop : g[2],
                cns: g[3],
                graph: g[1],
                sense: g[0],
                name: i ,
                alias : (typeof data == 'object' ? data.graph : data).toLowerCase()
            };
        }
        return l_graphs;
    }

};


/**
 * Класс Движка тренажера по схематизации
 * @extend Scheme
 */
function Sokrat(container, options) {

    var options = options ||  {};
    options.container = container;

    Sokrat.superclass.constructor.call(this, options);

    //количество соединений графем
    this.connections = 0;

    //выделенный элемент
    this.selGraph = null;

    //Массив соответствия спан идентификаторов и смыслов
    this.graphSenses = [];

    //можно ли взаимодействовать с графемами
    this.active = true;

    //функция, вызывающаяся при любом изменении на схеме
    this.onChange = null;

}
extend(Sokrat,Scheme);

mixin(Sokrat.prototype, {
    /**
     * поиск графем по селектору
     * @param selector
     * @returns {*}
     */
    a: function(selector){

        //Checker.initialize();

        //var ret = Checker.a(selector, graphs);

        ChunkManager.setData(SOKRAT.getGraphArray(this.level.graphs, E.getGraphData()));

        var matched = ChunkManager.trace(selector);

        return matched;


    },
    /**
     * проверка схемы на корректность
     * @param rules - правила проверки
     * @returns {*}
     */
    checkOut: function(rules){
        return Checker.checkOut(SOKRAT.getGraphArray(this.level.graphs,this.getGraphData()),rules);
    },

    /**
     * Получить интерактивный текст с тегами
     */
    getInteractive : function(){
        var self = this;
        this.level.interactive.replace(/\{(.*?)\}/gm,function(args,arg){
            args = arg.split(" ");
            if($.isNumeric(args[0])){
                self.graphSenses.push(args[0]);
            }else{
                if(args[0] == "span")self.graphSenses.push(args[1]);
            }
        });
    },
    /**
     * ыделить графему
     * @param graph
     */
    select: function (graph){
        if(this.selGraph){
            this.selGraph.unselect();
        }
        this.selGraph = graph;
        if(graph){
            graph.select();
        }
    },

    /**
     * Получить массив смыслов по идентификаторам
     * @param label  спан идентификатор
     */
    getSense: function (sense){

        var sense = this.level.labels[sense];
        if(typeof sense== 'object')sense = sense[0];
        if($.isArray(sense)){
            sense = sense[0];
        }
        if(sense) return sense;
        return 0;
    },
    /**
     * загрузка схемы
     * @param level
     * @returns {*}
     */
    load: function (level){
        this.level = level;
        this.scale = 1;
        var scheme = this;

        $.extend(level, level.data);

        this.graphSenses = [];

        if(level.interactive){
            if(typeof level.interactive == 'object'){
                level.interactive = "<p>" + level.interactive.join("</p><p>") + "</p>";
            }
            this.getInteractive();
        }
        this.beforeLoad(level);//TODO чтото сделать

        //создание элементов
        var els = this.level.elements;

        var self = this;
        if(this.level.graphs && this.level.graphs.images ){
            this.loadImages(this.level.graphs.images,this.images,function(){
                self.loadGraphs(els);
            })
        }else{
            self.loadGraphs(els);
        }
        return this;

    },
    /**
     * создание графем
     * @param els
     */
    loadGraphs: function(els){

        var _cns = {};
        for(var name in els){
            if(els[name].length){
                var elementGraph = els[name][1];
                var elementSense = els[name][0];
                var props = els[name][2];
            }else{
                elementGraph = els[name].graph;
                elementSense = els[name].sense;
                _cns[name] = els[name].rel;
                delete els[name].graph;
                delete els[name].sense;
                delete els[name].rel;
                var props = els[name];
            }


            props.name = name;
            props.sense = elementSense;
            props.graph = elementGraph;


            var graph =  this.createGraph(props);

            this.render.createGraphElement(graph);

        }

        //связывание объектов
        for(var name in els){

            var graph1 = this.getGraphByName(name);


            if(!graph1 || graph1._not_connectable)continue;

            if(els[name].length){
                var cns = els[name][3];
            }else{
                cns = _cns[name];
            }

            if(cns){
                for(var port1 in cns){
                    for(var con in cns[port1]){
                        var graph2 = this.getGraphByName(cns[port1][con][0]);

                        var port2 = cns[port1][con][1];
                        if(!graph2 || graph2 == graph1 || graph2._not_connectable)continue;
                        this.connect(graph1,port1,graph2,port2);
                    }
                }
            }

        }

        this.updateBounds();
        this.onload();//TODO чтото сделать
    },

    /**
     * загрука изображений используемых на схеме
     * @param sources
     * @param array
     * @param callback
     */
     loadImages: function(sources,array,callback) {
         var total = $.count(sources), current = 0;
         if(!total){
             callback();
            return;
         }
         var self =this;
        for(var src in sources) {
            array[src] = new Image();
            array[src].onload = function() {

                if(++current == total){
                    callback();
                }
            };
            array[src].src = sources[src];
        }
    },

    /**
     * функция callback
     * @param level
     */
    beforeLoad: function(level){},//TODO пустой метод

    /**
     * функция callback
     */
    onload: function(){},//TODO пустой метод

    /**
     * создание графа на схеме
     * @param options
     * @returns {*}
     */
    createGraph: function(options){
        var opt = $.extend(true,{},options);

        var graphClass = opt.graph;

        if($.isNumeric(opt.graph)){
            var data = this.level.graphs[opt.graph];

            if(!data){
                alert("ошибка, неправильно указана графема. name -" + opt.name +". Смысл - " +  opt.graph );
                return;
//                continue;
            }

            opt.graph = (typeof data == 'object' ? data.graph : data).toLowerCase();
            if( typeof data == 'object'){
                var _classprops = $.extend(true,{},data);
                $.extend(opt,_classprops);
            }
        }

        if(opt.sense){
            opt.label = this.getSense(opt.sense);
        }


        var object = this.graph(opt);
        if(object==null){
            mixin(opt,{
                label : "Ошибка: объект \"" + opt.graph  + "\" не существует",
                graph : "block",
                w : 200,
                h : 50,
                active: false,
                _not_connectable : true,
                attrs: {
                    area: {
                        fill: "red"
                    }
                }
            });
            object = this.graph(opt);
//            this.showError({type:"nograph",graph:opt.graph});return;
        }

        object.gsense = graphClass;
        object.sense = opt.sense;

        this.graphs[object.name] = object;
        this.onAddGraph(object);
        return object;
    },

    /**
     * список соединений графем на схеме
     */
    cns: {},

    /**
     * перепроверить граф на соединения
     * @param graph
     */
    process1: function(graph1){
        if(graph1._not_connectable)return;
        for(var j in this.graphs){
            var graph2 = this.graphs[j];
            if(graph1 == graph2 )continue;
//        if(graph1.sokratConnection){

            graph1.sokratConnection(graph2);

//            this.checkConnect(graph,this.graphs[j]);
        }
    },

    /**
     * перепроверит ьвсе графемы на соединения
     */
    process: function(){


        for(var i in this.graphs){
            var graph = this.graphs[i];
            if(graph.group == SOKRAT.GROUPS.FRAMES){
                this.disconnect1(graph);
            }
        }

        for(var i in this.graphs){
            var graph = this.graphs[i];
            if(graph.group == SOKRAT.GROUPS.FRAMES){
                this.process1(graph);
            }
        }
    },


    /**
     * Соеднинить графему
     * @param port1 порт
     * @param graph2 присоединяемая графемы
     * @param port2 порт присоединяемой графемы
     */
    //TODO CONNECTIONS
    connect: function (graph1,port1,graph2,port2){
        if(!port1) return;
        var cns = graph1.connections[port1];
        if(!cns){
            cns = graph1.connections[port1] = {};
        }else{
            for(var i in cns)if(cns[i][0] == graph2 && cns[i][1] == port2)return false;
        }

        var id = ++this.connections;
        cns[id] = [graph2,port2];

        if(port2){
            if(!graph2.connections[port2])graph2.connections[port2] = {};
            graph2.connections[port2][id] = [graph1,port1];

            SOKRAT.debug("C: " + graph1.name + ":" + port1 + ", " + graph2.name+ ":" + port2);

        }

        var cns2 = graph2.connections[port2]? graph2.connections[port2][id] : [{name:"-"},0];
        this.cns[id] = [cns[id],cns2];


        if(graph1.onConnect){
            graph1.onConnect(port1,graph2,port2);
        }

        if(graph2.onConnect){
            graph2.onConnect(port2,graph1,port1);
        }
        if(this.onChange){
            this.onChange();
        }

        graph1.updateConnection();
        if(port2)graph2.updateConnection();


        return this.cns[id];
    },

    /**
     * удалить все соединения графемы
     * @param graph1
     */
    disconnect1: function(graph1){
        for(var port1 in graph1.connections){
            this.disconnect2(graph1,port1);
        }
    },

    /**
     * удалить соединения графемы по определенному порту
     * @param graph1
     * @param port1
     */
    disconnect2: function(graph1,port1){
        for(var i in graph1.connections[port1]){
            this.disconnect(graph1,port1,i);
        }
    },

    /**
     * удалить конкретное соединение
     * @param graph1
     * @param port1
     * @param id
     */
    disconnect: function(graph1,port1,id){
        var _con = graph1.connections[port1][id];
        var graph2 = _con[0],port2  = _con[1];
        delete graph1.connections[port1][id];
        //список соединений
        delete this.cns[id];
        if(port2){
            delete graph2.connections[port2][id];

            if(graph2.onDisconnect){
                graph2.onDisconnect(port2,graph1,port1);
            }
        }


        if(graph1.onDisconnect){
            graph1.onDisconnect(port1,graph2,port2);
        }
        if(this.onChange){
            this.onChange();
        }

//        test("D: " + graph1.name + ":" + port1 + ", " + graph2.name+ ":" + port2);
    }

});
