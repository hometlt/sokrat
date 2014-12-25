

var Interface = {
    init: function(engine){

        //добавление настроек


        this.engine = engine;

        $.extend(this, {
            elements : {},
            sensesWindow:   new WindowSenses(), //  commentsWindow:   new WindowComments(I),
            editor:         null,
            background:     $("#x-canvas"),
            levelname: 0,
            resultsList :  $("#api_results_list"),
//            levelsGraphs:   R.set().hide(),
            delmode: 0
        });

        I.delete_square =  E.render.createDeleteArea();

        //todo замещение функции отпускания графемы. проверка попадания в зону удаления
        E.dragUp = function(pos){
            if(I.delete_square.isPointInside(event.x, event.y)){
                E.remove(graph);return false;
            }
            return true;
        };

        //замена функции выбора. активация кнопки
        E.select = function (graph){
            if(E.selGraph)E.selGraph.unselect();
            if(graph){
                graph.select();
                E.selGraph = graph;
                //todo I.delete_button.change("red","minus");

                I.delmode = 0;
            }else{
                //todo I.delete_button.change("yellow","warning");
                I.delmode=1;
            }
        };

        $(window).resize(function(){
            E.width = $(window).width();
            E.height = $(window).height();
            I.engine.updateBounds();
        });

        // Проверка на touch события
        var supportsTouch = ('ontouchstart' in document.documentElement);
        var event_action = supportsTouch ? 'touchstart': 'click';
//        var btnFinish = $("#home_but");
//        var btnSenses = $("#task_but");
        var btnDelete = $("#trash");
//        var btnCheck = $("#check_but");

        function toOrange(element){
            element.scheme.graphs.shape.attr({fill:'orange', stroke: "yellow"});
        }
        function toBlue(element){
            element.scheme.graphs.shape.attr({fill:'#277efa', stroke: "#57aefa"});
        }
//
//        $("#top_level_menu scheme")
//            .on("mouseover",function(){toOrange(this);})
//            .on("mouseout",function(){toBlue(this);})
//            .on("create",function(){toBlue(this);});

//        Scheme.update($("body"));



//
//        $("#api_level_edit").on(event_action, function(){
//
//            if(I.editor.hidden){
//                I.editor.show();
//            }else{
//                I.editor.hide();
//            }
//
//            $.historyLoad( "edit/"+I.lastUrls[1] );
//        });

//        btnSenses.on(event_action, function(){
//            I.sensesWindow.show();
//            $("#x-results").hide();
//            cl_any('s_slide_panel','-50',2);
//        });
//        btnFinish.on(event_action, function(){
//            $.historyLoad("#menu");
//            I.gamearea.hide();
//            $("#top_level_menu").hide();
//            I.closeLevel();
//        });
//        btnCheck.on(event_action, function(){
//            E.process();
//            API.levels_check(I.levelname /*this.levelname*/,E.getGraphData(), I.showResult);
//            I.sensesWindow.hide();
//            $("#x-results").show();
//            cl_any('s_slide_panel','-50',2);
//        });

        btnDelete.on(event_action, function(e){
            if(I.delmode==0){
                if(E.selGraph){ E.remove(E.selGraph)}
                //todo ;     I.delete_button.change("yellow","warning");
                I.delmode=1;
            }else{
                E.clear();
                E.loadGraphs(E.level.predefined);
            }
            e.preventDefault();
        });

    },


    selectLevel: function(level){
        I.topMenu.hide();
        I.mainWindow.hide();
//        I.levelsGraphs.hide();
        API.levels_load(level,function(data){
            I.levelname = level;

            data.data.elements = data.data.predefined;
            I.engine.load(data);
        });
    },

    closeLevel: function(){
        if(!I.engine.level)return;
        I.sensesWindow.lblLevelGraphs.empty();

        API.levels_save( I.levelname, this.engine.getGraphData(), function(data){
            if(data.error){
                alert($.toJSON(data.error));
            }else{
                I.engine.clear();
                delete I.engine.level;
            }
        });

    },

    showResultsMsg: function(messages, text, style){
        for(var i = 0 ; i < messages.length ; i++ ) {
            I.resultsList.append($("<span/>").addClass(style),$("<span/>").append( text + " " + messages[i]),$("<br/>"));
        }
    },

    showResult: function (data){


        I.resultsList.empty();

        I.showResultsMsg(data.messages.E, "Ошибка:", "critical");
        I.showResultsMsg(data.messages.W, "Предупреждение:", "warning");
        I.showResultsMsg(data.messages.N, "Замечание:", "notice");
        I.showResultsMsg(data.messages.M, "Сообщение:", "message");

        for(var i=0;i<data.groups.G.length;i++){
            //todo    I.engine.getGraphByName(data.groups.G[i]).select();
        }

        var text="",classname="";
        if(data.values.status==100){text ="Задача выполнена на отлично!";classname="message";}
        else if(data.values.status>85){text = "Задача выполнена хорошо";classname="notice";}
        else if(data.values.status>70){text = "Задача выполнена с предупреждениями";classname="warning";}
        else{text = "Задача не выполнена.";classname="critical";}

        text = "Результат: " + data.values.status + " " + text;

        I.resultsList.append($("<p/>").html(text).addClass(classname));

    },


    listInterface: function(){
        API.levels_list(function(data){
            var _list =  data.list;


            var container = $("#api_levels_list");
            container.empty();

            // for(var region in API.levelList) {
            var region= "";
            I.regions = {};
            I.regions[region] = $("<div/>");
            container.append(
                $("<h2/>").css("clear","both").text("Задачи" ),//API.levelList[region][0]),
                I.regions[region]
            );

            function createButtonR(level,name,region,hard, result){
                var divblock = $("<div/>"),scheme =  $("<scheme/>"),h3 = $("<h3/>").text(level.title), br = $("<br/>");

                //var link =$("<a/>").attr('href','#levels/'+name).append(scheme);
                var link = $("<a/>").attr('href','#levels/'+name).text(level.title);

                divblock.append(link);
                I.regions[region].append(divblock);
                // var s = new Scheme({data:{load: level.scheme},labels: false,container: scheme[0]});
            }


            for(var level in _list) {
                createButtonR(_list[level],level,region,_list[level][1],_list[level][2]);
            }
        });
    },


    deleteButton: function(){
        if(I.delmode==0){
            if(E.selGraph){ E.remove(E.selGraph)}
            I.delmode=1;
        }else{
            E.clear();
        }
    }

};