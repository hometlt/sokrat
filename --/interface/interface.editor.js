/**
 * редактор задач
 * @param fields
 */
function SokratEditor (fields){

    var Editor = this;

    this._dataContainer = $("#api_editor_data");

    this.container      = $("#x-editor");

    this.container.height($("#s_sp_content").height());

    this.fields = {};
    if(fields){
        for(var field in fields){
            this.addEditFields(field,fields[field]);
        }
    }else{
        for(var field in data){
            this.addEditFields(field,0);
        }
    }
        this._dataContainer.find("pre").on("paste",Editor.handlepaste).keypress(Editor.enterKeyPressHandler).focusout(function(){ Editor.pretty($(this));});//.mouseover(showHelper).mouseout(hideHelper);

    $("#api_editor_save").click(function(){
        var data = Editor.serveData();
        API.levels_edit(I.levelname, data, function(data){
            alert("Сохранено?" + JSON.stringify(data)); //todo обработать
            Editor.updateLevelList();
        });
    });

    $("#api_editor_preview").click(function(){
        Editor.preview();

//        $("#x-senses").show();
//        $("#api_editor_buttons").hide();
//        I.editor.hide();

    });

    $("#api_editor_check").click(function(){

        var dataArray = Editor.serveData();

        try{
            var instructions = API.decodeData(dataArray["process"]);
        // var graphs = decodeData(dataArray["elements"]);
        }catch(e){
            alert("Wrong syntax in field \"process\": " + e.message);
            return false;
        }

        E.process();

        var graphs = E.getGraphData();

//        try{
            var specification = API.decodeData(dataArray["graphs"]);
//        }catch(e){
//            alert("Wrong syntax in field \"graphs\": " + ":"  + e.message);
//            return false;
//        }

       // try{
            var data = Checker.checkOut(SOKRAT.getGraphArray(specification,graphs), instructions );
//        }catch(e){
//            alert("Check error " + ":"  + e.message);
//            return false;
//        }


        I.showResult(data);


        var graphstring = [];
        for(var i in this.l_graphs){
            graphstring.push("<br/>" + "<span style='color:blue'>" + i + "</span>: " + JSON.stringify(this.l_graphs[i]));
        }
        data.messages.S.push("GRAPHS:" + graphstring.join(","));



        var text = "CONNECTIONS <br/>";
        for(var i in E.cns){
            text +=  E.cns[i][0][0].name +" >" + E.cns[i][0][1]+ ":" + E.cns[i][1][1]+ " " + E.cns[i][1][0].name + "<br/>";
        }
        data.messages.S.push(text);


        I.showResultsMsg(data.messages.S, "", "system");


//
//        $("#x-results").show();
//        $("#api_editor_buttons").hide();
//        I.editor.hide();

    });


//
//    $("#api_editor_render").click(function(){
//        var _grahdata = JSON.stringify(E.getGraphData());
//        Editor.fields["elements"].text(_grahdata.substring(1,_grahdata.length-1));
//    });

    $("#api_editor_edit").click(function(){
        var _grahdata = JSON.stringify(E.getGraphData());
        Editor.fields["elements"].text(_grahdata.substring(1,_grahdata.length-1));
    });

    $("#api_editor_add").click(function(){

        API.levels_create(function(data){
            API.levels_full(data.create.id,function(data){
                Editor.loadData(data);
            });
        });
    });



    this._select = $("#api_levels_select").change(function(){


        var id = $(this).val();

        API.levels_full(id,function(data){
            I.levelname = data.id;
            I.editor.loadData(data);
        });
    });

}




mixin(SokratEditor.prototype, {

    show: function(){

        this.hidden = false;
        this.container.fadeIn();
    },

    hide: function(){

        this.hidden = true;
        this.container.fadeOut();
    },

    loadData: function (data){


        var Editor = this;
        for(var field in data){
            if(field == "id"){
                this.levelID = data[field];
                continue;
            }
            if(this.fields[field]){
                this.fields[field].html(data[field].replace(/\n/g,"<br/>"));
            }
        }
        prettyPrint();
        this.preview();

        API.levels_saveList(this.levelID,function(data){
            for(var i=data.saveList.length;i--;){

                var p = $("<p>").attr("id",i).text(data.saveList[i].id + data.saveList[i].name).click(function(){


                        var dataArray = Editor.serveData();
                        var i = $(this).attr("id");
                        dataArray.elements = data.saveList[i].elements;


                        E.clear();
                        var level = API.evalLevel(dataArray);


                        E.load(level);
                    }
                );
                if(Editor.fields.savelist){
                    Editor.fields.savelist.append(p);
                }
            }
        })
    },

    enterKeyPressHandler: function(evt) {

        var sel, range, br, addedBr = false;
        evt = evt || window.event;
        var charCode = evt.which || evt.keyCode;
        if (charCode == 13) {
            if (typeof window.getSelection != "undefined") {
                sel = window.getSelection();
                if (sel.getRangeAt && sel.rangeCount) {
                    range = sel.getRangeAt(0);
                    range.deleteContents();
                    br = document.createElement("br");
                    range.insertNode(br);
                    range.setEndAfter(br);
                    range.setStartAfter(br);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    addedBr = true;
                }
            } else if (typeof document.selection != "undefined") {
                sel = document.selection;
                if (sel.createRange) {
                    range = sel.createRange();
                    range.pasteHTML("<br>");
                    range.select();
                    addedBr = true;
                }
            }

            // If successful, prevent the browser's default handling of the keypress
            if (addedBr) {
                if (typeof evt.preventDefault != "undefined") {
                    evt.preventDefault();
                } else {
                    evt.returnValue = false;
                }
            }
        }
    },

    pretty : function(el){
        el.html(el.html().replace(/<[/]*span[\sa-z"=]*>/g,""));
        el.addClass('prettyprint');
        prettyPrint();
    },

    serveData: function(){
        var data = {};
        this._dataContainer.find("pre").each(function(){
            data[$(this).attr("alt")] = $(this).html()
                .replace(/<br>/g,"\n")
                .replace(/&nbsp;/g," ")
                .replace(/<[^>]*>/g,"")
                .replace(/&lt;/g,"<")
                .replace(/&gt;/g,">")
                .replace(/&amp;/g,"&");
        });
        return data;
    },

    addEditFields: function (field,value){
        if(value == "div"){
            var datafield = $("<div/>");
        }else{
            var datafield = $("<pre/>").attr({alt: field,contentEditable: true})
                .addClass('prettyprint');
        }


        var title =$("<div/>").text(field).css("cursor","pointer").click(function(){
            if(span.hidden){
                span.hidden = false;
                datafield.show('slow');
            }else{
                span.hidden = true;
                datafield.hide('slow');
            }
        });

        var span =  $("<div/>");
        if(value !=0){
            span.css({float: value>0?"left":"right", width: Math.abs(value)})
        }

        span.append(title,datafield);

        this._dataContainer.append(span);
        if( value == 0){
            this._dataContainer.append( $("<div/>").css("clear","both"));
        }


        this.fields[field] = datafield;
    },


    handlepaste: function() {
        var elem = event.target, e = event;
        var data =  e.clipboardData.getData("text").replace(/<br>/g,"\n").replace(/<[^>]*>/g,"").replace(/\n/g,"<br/>");
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            span = document.createElement("span");
            span.innerHTML = data;
            range.insertNode(span);
            range.setEndAfter(span);
            range.setStartAfter(span);
            sel.removeAllRanges();
            sel.addRange(range);
            addedBr = true;
        }

        e.stopPropagation();
        e.preventDefault();
        //  e.clipboardData = e.clipboardData.replace(/<br>/g,"\n").replace(/<[^>]*>/g,"").replace(/\n/g,"<br/>");
    },





    preview: function(){
        var dataArray = this.serveData();
        var level = API.evalLevel(dataArray);

        E.clear();
        E.load(level);
        //I.commentsWindow.update(E.level);
//
//        $("#top_menu").hide();
//        $("#top_level_menu").show();
//        E.show();
//
//        $("#x-mainwindow").hide();
    },



    updateLevelList: function(){
        var Editor = this;
        this._select.empty();
        API.levels_list(function(data){
            for(var level in data.list) {
                Editor._select.append($("<option>").text(data.list[level].title).attr("value",level));
                Editor._select.val(I.levelname);
            }
        });
    }

});
