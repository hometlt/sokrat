
VERSION +=1;

var Interface = {
    init: function(engine){

        //добавление настроек
        this.engine = engine;

        $.extend(this, {
            STATUS: {
                EDITOR: 1,
                LEVEL : 2
            },

            elements : {},
            sensesWindow:   new WindowSenses(), //  commentsWindow:   new WindowComments(I),
            editor:         null,
            background:     $("#x-canvas"),
//            slides:         new Slides($("#api_slides")),
            mainWindow:     $("#x-mainwindow"),
            mainWindowMenu: $("#x-mainwindow > div"),
            debugtext:      $("#x-debug"),
            debugConsole:   $("#x-console"),
            debugWindow:   $("#test"),
            topMenu:        $("#top_menu"),
            auth:           new WindowAuth($("#api_login")),
            account:        $("#api_accaunt"),
            mainPage:       $("#api_main"),
            continueButton: $("#api_result_continue").click(function(){I.mainWindow.hide();}),
            levelname: 0,
            resultsList :  $("#api_results_list"),
//            levelsGraphs:   R.set().hide(),
//            delmode: 0
        });

        $("#x-about").click(function(){ I.slides.load("specs.html").show();});
        $("#x-bruno").click(function(){ I.slides.load("bruno.html").show();});
        $("#x-graphs").click(function(){I.makeGraphList();});


        // if(SOKRAT.SETTINGS.test){
        this.activateConsole();
        // }


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

//                I.delmode = 0;
            }else{
                //todo I.delete_button.change("yellow","warning");
//                I.delmode=1;
            }
        };

        $(window).resize(function(){
            E.width = $(window).width();
            E.height = $(window).height();
            I.engine.updateBounds();
        });




        ///обработка ссылки ////////
        I.initPages();


        //createMenu();

    },


    activateConsole: function(){
        $(document).bind("keydown",function(e){
            if($("pre:focus").length || $("input:focus").length)return;

            switch(e.keyCode){
                case 27:

                    if(I.debugWindow.is(':visible') ){
                        I.debugWindow.hide();
                    }else{
                        I.debugWindow.show();
                    }
                    break;
            case 68:
//            case 8:
//                if(E.selGraph){
//                    E.remove(E.selGraph);
//                }
//                    break;
            case 9:
                $("#s_slide_panel").show();

                if(I.sensesWindow.visible){

                    I.sensesWindow.hide();
                    $("#x-results").hide();
                    $("#api_editor_buttons").show();
                    I.editor.show();
                }else if(!I.editor.hidden){
                    $("#x-results").show();
                    $("#api_editor_buttons").hide();
                    I.editor.hide();
                }else{
                    $("#x-results").show();
                    I.sensesWindow.show();
                }
            }
        });

        I.debugConsole.keydown(function (event) {
            if (event.which == 13) {
                var arr= $(this).val().split(" ");
                if(arr[0]=="test"){
                    E.test(E.getGraphByName(arr[1]));
                }else if(arr[0]=="clear"){
                    I.debugtext.empty();
                }else{
                    try {
                        SOKRAT.debug(window.eval($(this).val()));
                    }
                    catch (e){
                        SOKRAT.debug(e);
                    }
                }
            }
        });
    },

    initPages: function(){
        I.levelInterface();


//      html5 offers pushState
//      window.history.pushState(data, "Title", "/new-url");



        $.historyInit(function(url){
            var urls = url.split("/");

            //зарегистрирован ли пользователь
            if (!$.cookie('triplet', undefined)){
                I.auth.show();
                I.account.hide();
            }else{
                I.account.show();
                I.auth.hide();
            }

            //проеверка , откуда перешел пользователь
            if(I.lastUrls){
                //закрыть
                if(I.lastUrls[0] == 'levels'  && I.lastUrls[1] && I.engine.level){
                    E.hide();
                    $("#top_level_menu").hide();
                    I.closeLevel();
                    // $("#top_menu").show();
                }
                if(I.lastUrls[0] == 'slides' && urls[0]!='slides'){
                    $("#api_slides_counter").hide();
                }
            }




            if(urls[0] == "register"){
                I.mainWindowMenu.hide();
                I.mainWindow.show();
                $("#api_register").show();
            }else if(urls[0] == "slides"){
                //todo перенести в обработку хэша изменение слайда
                //в обработчиках стрелок поставить изменение хэша.
                if(!(I.lastUrls && I.lastUrls[0]=="slides" && I.lastUrls[1] == urls[1] ) ){
                    I.mainWindowMenu.hide();
                    I.mainWindow.show();
                    I.slides.makeSlides(urls[1],urls[2]);
                    $("#api_slides").show();
                    $("#api_slides_counter").show();
                }
            }else if(urls[0] == 'levels'){

                this.mode = Interface.STATUS.LEVEL;
                if(urls[1]){
                    API.levels_load(urls[1],function(data){
                        I.levelname = urls[1];

                        data.data.elements = data.data.predefined;
                        I.engine.load(data);
                        //I.commentsWindow.update(I.engine.level);

                        I.topMenu.hide();
                        $("#top_level_menu").show();
                        E.show();

                        I.mainWindow.hide();
                    });
                }else{
                    I.mainWindowMenu.hide();
                    I.mainWindow.show();
                    I.listInterface();
                    $("#api_levels").show();
                }
            }else if(urls[0] == 'create'){
                API.levels_create(function(data){
                    $.historyLoad(["edit",data.create.id].join("/"))
                });
            }else if(urls[0] == 'edit'){

                this.mode = Interface.STATUS.EDITOR;
                API.levels_full(urls[1],function(data){

                    if(!I.editor){
                        //hide_all();
                        $("#top_level_menu").show();
                        E.show();
                        $("#s_slide_panel").show();
                        $("#act_buttons").show();
                        $("#home_but").show();
                        $("#trash").show();

                        I.editor = new SokratEditor({name:100,category:-50,difficulty:-50,scenario:-50,title:0,task:0,interactive:0,graphs: 0,labels:0,process:0,elements:0,predefined: 0,savelist: "div"});

                        $("#act_buttons").hide();
                        $("#x-editor").show();
                        $("#api_editor_buttons").show();
                        I.editor.show();
                    }
                    I.levelname = data.id;
                    I.editor.loadData(data);

                });
            }else if(urls[0] == 'menu'){
               // hide_all();
                $("#w_bk").show();
                edit_title("Главное меню");
                $("#w_social").show();
                $("#back_side").show();
                $("#w_field_tabs").show();

            }else if(urls[0] == 'task'){
                if(urls[1]){
                    hide_all();
                    API.levels_load(urls[1],function(data){
                        I.levelname = urls[1];  //todo убрать

                        data.data.elements = data.data.predefined;
                        I.engine.load(data);
                        $("#top_level_menu").show();
                        E.show();
                        $("#s_slide_panel").show();
                        $("#act_buttons").show();
                        $("#home_but").show();
                        $("#trash_field").show();
                        $("#trash").show();
                        I.mainWindow.hide();
                        //$("#task_btn").click();
                        I.sensesWindow.show();
                        $("#x-results").hide();
                        $("#back_link").show();
                        put_href('back_link','#task');
                        cl_any('s_slide_panel','-50',2);
                    });
                }else{
                    E.clear();
                    hide_all();
                    create_table();
                    edit_title("Задачи");
                    $("#w_bk").show();
                    $("#back_side").show();
                    $("#w_social").show();
                    $("#task_table").show();
                    $("#back_link").css({'display':'block'});
                    put_href('back_link','#menu');
                }
            }/*else if(urls[0] == 'process'){
             API.levels_process(urls[1],function(data){
             $("#x-mainwindow > div").hide();
             I.mainWindow.show();
             I.editorInterface(data );
             $("#api_editor").show();
             });
             }*/else{
                //I.mainWindowMenu.hide();
                //I.mainWindow.show();
                //I.mainPage.show();

                $("#w_bk").show();
                $("#w_auth").show();
                $("#w_social").show();
                $("#back_side").show();
                $("#w_title").show();
            }

            I.lastUrls = urls;
        });

        if (!$.cookie('triplet', undefined)){

        }else {
            I.auth.onAuth();
        }


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


    /**
     * загрузка главного окна
     //     */
//    initialInterface : function(){
//        if(!I._interface_initialized){
//            $(".level-link").click(function(){
//                I.selectLevel(attrs.level);
//                return false;
//            });
//
//            Scheme.update(I.mainWindow);
//            I._interface_initialized = true;
//        }
//    },

    deleteButton: function(){
        if(E.selGraph){
            E.remove(E.selGraph);
        }else{
            E.clear();
        }
    },


    levelInterface: function(){
        // Проверка на touch события
        var supportsTouch = ('ontouchstart' in document.documentElement);
        if(supportsTouch == true){
            var event_action = 'touchstart';
        }else{
            var event_action = 'click';
        }
        var btnFinish = $("#home_but");
        var btnSenses = $("#task_but");
        var btnDelete = $("#trash");
        var btnCheck = $("#check_but");

        function toOrange(element){
            element.scheme.graphs.shape.attr({fill:'orange', stroke: "yellow"});
        }
        function toBlue(element){
            element.scheme.graphs.shape.attr({fill:'#277efa', stroke: "#57aefa"});
        }

        $("#top_level_menu scheme")
            .on("mouseover",function(){toOrange(this);})
            .on("mouseout",function(){toBlue(this);})
            .on("create",function(){toBlue(this);});

        Scheme.update($("body"));




        $("#api_level_edit").on(event_action, function(){

            if(I.editor.hidden){
                I.editor.show();
            }else{
                I.editor.hide();
            }

            $.historyLoad( "edit/"+I.lastUrls[1] );
        });

        btnSenses.on(event_action, function(){
            I.sensesWindow.show();
            $("#x-results").hide();
            cl_any('s_slide_panel','-50',2);
        });
        btnFinish.on(event_action, function(){
            $.historyLoad("#menu");
            I.gamearea.hide();
            $("#top_level_menu").hide();
            I.closeLevel();
        });
        btnCheck.on(event_action, function(){
            E.process();
            API.levels_check(I.levelname /*this.levelname*/,E.getGraphData(), I.showResult);
            I.sensesWindow.hide();
            $("#x-results").show();
            cl_any('s_slide_panel','-50',2);
        });


    }

};


/*


 var btnSave = $("#api_level_save");

 btnSave.click(function(){


 //    var canvas_=document.getElementById("x-canvas");
 // var text = (new XMLSerializer()).serializeToString(canvas_);
 // var encodedText = encodeURIComponent(text);
 // open("data:image/svg+xml," + encodedText);
 var bb = new BlobBuilder();
 bb.append(R.toSVG());//(new XMLSerializer).serializeToString(document));
 var blob = bb.getBlob("application/xhtml+xml;charset=" + document.characterSet);
 saveAs(blob, "1.svg");
 });
 */



