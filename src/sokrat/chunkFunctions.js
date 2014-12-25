var TESTCHUNKTYPE = {

    MOD: function (graph){
        if(graph.name % parseInt(this.instruction.substr(1)) == 0 ){
            return [graph];
        }
        return [];
    },

    NEXT: function (graph){

        var el = ChunkManager.getElementByName(graph.name);

        if(el.nextEl){
            alert(el.nextEl.name);
            var _g = new СhunkElement(graph);
            _g.path.push(graph.name);
            _g.name = el.nextEl.name;
            return [_g];
        }
        return [];
    },

    A: function(graph){
        if(graph.name < 40){
            graph.values["A"] = 1;
            return [graph];
        }else if(graph.name > 100){
            graph.values["A"] = 2;
            return [graph];
        }else
            return [];
    },

    getAction: function(instruction){
        if(instruction[0] == "A")return CHUNKTYPE.A;
        if(instruction[0] == "%")return CHUNKTYPE.MOD;
        if(instruction[0] == ">")return CHUNKTYPE.NEXT;
    }

};


var CHUNKTYPE = {

    //todo
    ALL: function(chunk){
        var result = [];
        for(var i = ChunkManager.elements.length; i--;){
            var _g = new СhunkElement(chunk);
            _g.name = ChunkManager.elements[i].name;
            result.push(_g);
        }
        return result;
    },

    NUMERIC: function (chunk,graph){

        if(this.CHUNK._i_sense && graph.sense != this.CHUNK._i_sense)return false;
        var cg = this.CHUNK._i_graph;
        if(cg){
            if(!$.isNumeric(cg)){
                var value2 = chunk.getValue(cg);
                if(value2){
                    cg = value2;
                }else{
                    chunk.values[cg] = graph.graph;
                    return true;
                }
            }
            if(graph.graph != cg)return false;
        }
        return true;
    },


    NOT: function(chunk,graph){
        var _els = [];
        for(var i =0;i< ChunkManager.elements.length; i++){
            var _g = new СhunkElement(chunk);
            _g.name = ChunkManager.elements[i].name;
            _g.dataElement = ChunkManager.elements[i].dataElement;
            _els.push(_g);
        }

        var results = this.CHUNK.chunk.runGroup(_els);
        for(var i = results.length; i-- ;){
            if(chunk.name == results[i].name)return false;
        }
        return true;
    },


    NEXT: function(chunk,graph){
        var result = [];

        var port1 = this.CHUNK.port1;
        var port2 = this.CHUNK.port2;


        //если данные о порте уже записаны то делаем замену
        if(!$.isNumeric(port1)){
            var value1 = chunk.getValue(port1);
            if(value1) port1 = value1;
        }
        if(!$.isNumeric(port2)){
            var value2 = chunk.getValue(port2);
            if(value2) port2 = value2;
        }

        var alias1 = !$.isNumeric(port1);

        //нужно ли сохранять второй порт
        var alias2 = !$.isNumeric(port2);

        //обход всех возможных дотупныз портов
        for(var _port1 in graph.cns){
            if(!alias1 && port1!=0 && (this.CHUNK.not1  ? _port1 == port1 :  _port1 != port1  ) || !graph.cns[_port1])continue;

            for(var j=0; j < graph.cns[_port1].length;j++){
                var con =  graph.cns[_port1][j];
                var _port2 = con[1];
                var _gname = con[0];

                if(_gname == chunk.path[chunk.path.length-1])continue;

                if( (this.CHUNK.not2 ? _port2 != port2 : port2 == _port2) || port2 == 0 || alias2){
                    var _g = new СhunkElement(chunk);
                    _g.path.push(chunk.name);
                    _g.name = _gname;
                    if(alias2)_g.values[port2] = _port2;
                    if(alias1)_g.values[port1] = _port1;
                    result.push(_g);
                }
            }
        }
        return result;
    },

    INPATH: function(chunk){
        return (chunk.path.indexOf(chunk.name)!=-1);
    },


    /**
     *
     * $A - проверяет принадлежность графемы к группе А или, если группа еще не создана то создает такую группу и добавляет в нее графему
     * @param chunk
     * @param graph
     */
    GROUP: function(chunk, graph){
        if(graph.name == this.CHUNK.groupname) return true;//todo? //graph1, graph2 ,...
        var group =  Checker.getGroup(this.CHUNK.groupname,chunk);
        if(group){
            for(var i =0;i<group.length;i++){
                if(group[i] == graph.name){
                    return true;
                }
            }
        }else{
            chunk.groups[this.CHUNK.groupname] = [graph.name];
            return true;
        }


        return false;
    },
    //cGraphs.setItems(array_intersection(cGraphs,d));

    LEN: function(chunk,graph){
        var _r = this.CHUNK.chunk.run(chunk);
        var lenResult = _r.length;
        return (Checker.matchCount(this.CHUNK.lenCount,lenResult)==0);
    },

    CON: function(chunk,graph){


        var results ,newresults = [chunk];


            for(var n = this.CHUNK.chunks.length;n--;){

                results = this.CHUNK.chunks[n].runGroup(newresults);
                newresults = [];
                for(var i =0; i <  results.length;i++){
                    var c = new СhunkElement(chunk);
                    c.values = results[i].values;
                    c.groups = results[i].groups;
                    newresults.push(c)
                }
            }
        return newresults;

//            var _r = this.CHUNK.chunks[n].run(chunk);
//
//            if(_r.length == 0)return false;
//            mixin(chunk.values, _r[0].values);
//            mixin(chunk.groups, _r[0].groups);
//            chunkResults.push(_r);
//        }
//
//        var result = [chunk];
//        for(var i = 0;  i< chunkResults.length;i++){
//            result = chunk.mergeResults(result,chunkResults[i]);
//        }
//        return result;
    },

    JOIN: function(chunk, graph){
        var chunkResults = [];
        for(var n = this.CHUNK.chunks.length;n--;){
            var _r = this.CHUNK.chunks[n].run(chunk);
            chunkResults.add(_r);
        }
        for(var i = 0;  i< chunkResults.length;i++){
            if(chunk.name == chunkResults[i].name )return true;
        }
        return false
    },

    SECTIONS: function(chunk,graph){
        var result = [];
        var _separators = this.CHUNK.chunk.runGroup(ChunkManager.elements);
        var port =1;

        for(var s = _separators.length;s--;){
            var _sep =  ChunkManager.getGraph(_separators[s].name);
            var _p = _sep.prop;

//            if( GRAPH.CLASS(_sep.alias).prototype.inside.call(_sep,graph.prop.c[0],graph.prop.c[1])

            if(Math.lowerThanLine(_p.ps[0][0],_p.ps[0][1],_p.ps[1][0],_p.ps[1][1],graph.prop.c[0],graph.prop.c[1])){
                port += Math.pow(2,s);
            }
        }

        DataElement.connect(this.CHUNK.section.dataElement,port,graph,10);

        return [this.CHUNK.section]
    },

    //todo
    SET: function(chunk){
        var expr = Checker.parseExpression(this.CHUNK.expression,chunk,chunk.dataElement);
        var value = eval(expr);
        chunk.dataElement.prop[this.CHUNK.property] = value;
    },

    IF: function(chunk){
        var condition = this.CHUNK.chunkCondition.run(chunk);
        var innerChunk = condition.length ? this.CHUNK.chunkYes : this.CHUNK.chunkNo ;
        return innerChunk.run(chunk);
    },


    M: function(chunk){
        Checker.addMessage(this.CHUNK.message,chunk );
        return true;
    },


    G: function(chunk,graph){

        if(!chunk.groups[this.CHUNK.group]) chunk.groups[this.CHUNK.group] = [];
        var label = this.CHUNK.label ?  Checker.parseExpression(this.CHUNK.label,chunk,graph) :  graph.name;
        if(this.CHUNK.PERMANENT){
            Checker.g(this.CHUNK.group,label);
        }else{
            chunk.groups[this.CHUNK.group].add(label );
        }
    },

    PLUS: function(chunk,graph){
        var expr = Checker.parseExpression(this.CHUNK.message,chunk);
        var value = eval(expr);
        if(value <  0) value = 0;
        Checker.values.plus += value;
    },

    MINUS: function(chunk,graph){
        var expr = Checker.parseExpression(this.CHUNK.message,chunk);
        var value = eval(expr);
        if(value <  0) value = 0;
        Checker.values.minus += value;
    },

    EVAL: function(chunk,graph){
        var expr = Checker.parseExpression(this.CHUNK.text,chunk,graph);
        return !!eval(expr);
    },

    NOTHING: function(chunk,graph){
        return true;
    },


    EMPTY: function(chunk,graph){
        return false;
    },


    getAction: function(instruction){

        if(instruction == "*")return CHUNKTYPE.ALL;
        if(instruction == "-")return CHUNKTYPE.EMPTY;
        if(instruction[0] == "$"){
            this.CHUNK.groupname = instruction.substring(1);
            return CHUNKTYPE.GROUP;
        }
        if(instruction[0] == ">"){
            var array = instruction.match(/\>(\!)?(\w+)?(:(\!)?(\w+))?/);
            if(array!=null){
                this.CHUNK.not1  = array[1];
                this.CHUNK.port1 = array[2] || 0;
                this.CHUNK.not2  = array[4];
                this.CHUNK.port2 = array[5] || 0;

                return CHUNKTYPE.NEXT;
            }
        }
        if($.isNumeric(instruction)){
            var _mods = instruction.split(".");
            this.CHUNK._i_sense = _mods[0];
            this.CHUNK._i_graph = _mods[1];
            return CHUNKTYPE.NUMERIC;
        }
        if(instruction[0] == "."){//todo
            var _mods = instruction.split(".");
            this.CHUNK._i_sense = _mods[0];
            this.CHUNK._i_graph = _mods[1];
            return CHUNKTYPE.NUMERIC;
        }

        var pos = instruction.indexOf("(");
        if(pos!=-1){
            //проверка модификаторов
            var type = instruction.substring(0,pos), arg = instruction.substring(pos+1,instruction.length-1);
            var args;
            switch(type){
                case "#":
                    return CHUNKTYPE.NOTHING;
                case "inpath" :
                    return CHUNKTYPE.INPATH;
                case "if" :
                    args = splitBy(arg,",");
                    this.CHUNK.chunkCondition = new Chunk(args[0]);
                    this.CHUNK.chunkYes = new Chunk(args[1]);
                    this.CHUNK.chunkNo = new Chunk(args[2]);
                    return CHUNKTYPE.IF;
                case "eval" :
                    this.CHUNK.text = arg;
                    return CHUNKTYPE.EVAL;
                case "set" :
                    args = splitBy(arg,",");
                    this.CHUNK.expression = args[1];
                    this.CHUNK.property = args[0];
                    return CHUNKTYPE.SET;
                case "len" : //todo len(>:1,2:)  =>    con(>:1 [2:])
                    args = splitBy(arg,",");
                    this.CHUNK.chunk = new Chunk(args[0]);
                    this.CHUNK.lenCount = args[1];
                    return CHUNKTYPE.LEN;
                case "m" :
                    this.CHUNK.message = arg;
                    return CHUNKTYPE.M;
                case "+":
                    this.CHUNK.message = arg;
                    return CHUNKTYPE.PLUS;
                case "-":
                    this.CHUNK.message = arg;
                    return CHUNKTYPE.MINUS;
                case "add" :
                    this.CHUNK.PERMANENT = true;
                case "g" :
                    arg = splitBy(arg,",");
                    this.CHUNK.group = arg[0];
                    this.CHUNK.label = arg[1];
                    return CHUNKTYPE.G;
                case "sections" :
                    this.CHUNK.chunk = new Chunk(arg);
                    this.CHUNK.section = ChunkManager.addElement("sections");
                    return CHUNKTYPE.SECTIONS;
                case "not" :
                    this.CHUNK.chunk = new Chunk(arg);
                    return CHUNKTYPE.NOT;
                case "con" :
                    args = splitBy(arg,",");
                    this.CHUNK.chunks = [];
                    for(var i = args.length;i--;){
                        this.CHUNK.chunks.push(new Chunk(args[i]));
                    }
                    return CHUNKTYPE.CON;
                case "":
                    args = splitBy(arg,",");
                    this.CHUNK.chunks = [];
                    for(var i = args.length;i--;){
                        this.CHUNK.chunks.push(new Chunk(args[i]));
                    }
                    return CHUNKTYPE.JOIN;
                default:
                    if(!Checker.functions[type]){
                        Checker.functions[type] = this;
                        this.getAction(arg);
                    }else{
                        this.firstInnerChunk = Checker.functions[type];
                    }
                    return false ;
            }
        }
    }
};