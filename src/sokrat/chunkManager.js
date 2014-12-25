
function Chunk (query){
    this.firstInnerChunk = null;
    this.lastInnerChunk = null;
    this.nextChunk = null;
    this.type = null;

    this.CHUNK = {};

    this.instruction = query.replace(/\s+/gm," ").replace(/^\s+/gm,"").replace(/\s+$/gm,"");

    this.getAction(this.instruction);
}



Chunk.prototype.JOIN = function(chunk,graph){
    var chunkResults = [];
    for(var n = this.CHUNK.chunks.length;n--;){
        var _r = this.CHUNK.chunks[n].run(chunk);
        chunkResults.add(_r);
    }
    return chunkResults;
};

Chunk.prototype.getAction = function (instruction){

    var queries = splitBy(instruction,",");
    if(queries.length > 1){

        this.CHUNK.chunks = [];
        for(var i = queries.length;i--;){
            this.CHUNK.chunks.push(new Chunk(queries[i]));
        }

        this.type = Chunk.prototype.JOIN;
        return;
    }

    var _chunks = splitBy(instruction," ");
    if(_chunks.length>1){
        for(var i=0; i< _chunks.length;i++){
            this.addChunk(new Chunk(_chunks[i]));
        }
    }else{
        this.type = CHUNKTYPE.getAction.call(this,instruction);
    }
};

Chunk.prototype.addChunk = function(chunk){
    if(this.lastInnerChunk){
        this.lastInnerChunk.nextChunk = chunk;
    }else{
        this.firstInnerChunk = chunk;
    }
    this.lastInnerChunk = chunk;
};

Chunk.prototype.runGroup = function(group){
    var results = [];
    for(var i= group.length; i--;){
        results.add(this.run(group[i]));
    }
    return results;
};

Chunk.prototype.run = function(graph){

    var resultGraphs = [graph];
    if(this.type){
        var _r = this.type.call(this,graph, ChunkManager.getGraph(graph.name));
        if(_r === false) resultGraphs  = [];
        if(typeof _r == "object") resultGraphs = _r;
    }else{
        if(this.firstInnerChunk){
            resultGraphs = this.firstInnerChunk.run(graph);
        }
    }

    var result = [];
    if(this.nextChunk){
        for(var i= resultGraphs.length;i-- ;){
            result.add(this.nextChunk.run(resultGraphs[i]));
        }
    }else{
        result = resultGraphs;
    }

    return result;
};

var ChunkManager = {

    getGraph: function (name){
        return this.dataElements[name];
//        for(var i=this.dataElements.length;i--;){
//            if(this.dataElements[i].name == name){
//                return this.dataElements[i];
//            }
//        }
    },


    chunk: null,

    elements : [],

    dataElements: {},

    setData: function(data){
        this.dataElements = data;
        this.elements = [];
        for(var i in data){
            var _el = new СhunkElement(i);
            _el.dataElement = data[i]
            this.elements.push(_el);
        }
        return this;
    },

    addElement: function(elementName) {
        var dataElement = new DataElement(elementName);
        this.dataElements[elementName] = dataElement;

        var _el = new СhunkElement(elementName);
        _el.dataElement = dataElement
        this.elements.push(_el);
        return _el;
    },

    trace: function(instruction, elements){
        this.chunk = new Chunk(instruction);

        return this.chunk.runGroup(this.elements);
/*
        //todo/////
        var x = this.chunk.runGroup(this.elements);

        var g = [];
        for(var i=x.length; i--;){
            g.push(x[i].name);
        }

        writeln($.toJSON(g));
        var text = []
        for (var  i in x){
            text.push($.toJSON(x[i]));
        }
        writeln("<span class='small'>" + text.join("<br>") + "</p>");
        writeln("");
        //////

        writeln($.toJSON(this.getValues(x)));

        return this;*/
    },


    /**
     *
     * @param result
     */
    getValues: function(result){
        var values = {};
        var groups = {};

        for(var i = result.length; i--;){
            for(var valname in result[i].values){
                var _r = result[i].values[valname];
                if(!values[valname])values[valname] = {};
                if(!values[valname][_r])values[valname][_r] = [];
                values[valname][_r].push(result[i].name);
            }


            /*for(var j = result[i].groups.length ; j--;){
                var valname = result[i].groups[j];
                if(!groups[valname])groups[valname] = [];
                groups[valname].add(result[i].groups[valname]);
                // if(!groups[valname][_r])groups[valname][_r] = [];
                //groups[valname][_r].add(result[i].groups[valname]);
            }*/
        }
        return {values: values, groups : groups}
    }

};


function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}

