
function WindowSenses(){
    var self = this;

    self.container        = $("#x-senses");
    self.lblLevelTitle    = $("#x-levelTitle");
    self.lblLevelText     = $("#x-levelText");
    self.lblLevelTask     = $("#x-levelTask");
    self.lblLevelGraphs   = $("#x-levelGraphs");
    self.text_area        = $("#x-text_area");


    E.beforeLoad = function(level){
        self.prepareSenseWindow(level);
    };

    E.onAddGraph = function(graph){
        var last=-1;
        for(var i in E.graphSenses){
            if(E.graphSenses[i]==graph.label){
                if(last==-1)last = i;
                if($(self.lblLevelText.find("span")[i]).hasClass("selected")){
                    $(self.lblLevelText.find("span")[i]).addClass("exists");
                    return;
                }
            }
        }
        if(last!=-1){
            $(self.lblLevelText.find("span")[last]).addClass("selected");
            $(self.lblLevelText.find("span")[last]).addClass("exists");
        }
    };

    E.onDeleteGraph = function(graph){
        if(E.a("" + graph.label).length==0){
            for(var i=0;i< E.graphSenses.length;i++){
                if(E.graphSenses[i] == graph.label){
                    $(self.lblLevelText.find("span")[i]).removeClass("exists");
                }
            }
        }
    };

}

mixin(WindowSenses.prototype, {

    toggle: function(){
        if(this.visible)this.hide();else this.show();
    },

    show: function(){
        this.visible = true;
        this.container.show();
        this.text_area.height(this.container.height()-70);
    },
    hide: function(){
        this.visible = false;

        this.container.hide();
    },

    prepareSenseWindow: function(l){
        var sw = this;
        var i=0;

        var htmlInteractive = l.interactive.replace(/\{(.*?)\}/gm,function(args,a){
            var pos = a.indexOf(" ");
            if(pos!=-1){
                var sense= a.substring(0,pos);
                var body= a.substring(pos+1);
            }else{
                sense = a;
            }

            if($.isNumeric(sense)){
                return '<span id='+ i++ + '>'+ body + '</span>';
            }

            if(sense=="scheme"){
                return '<scheme style="display: inline;height: 25px; width: 25px;">'+body+'</scheme>';
            }if(sense=="span"){
                return '<span id=' + i++ + '>';
            }if(sense=="/span"){
                return '</span>';
            }
        });

        sw.lblLevelTitle.text(l.title);
        sw.lblLevelText.html(htmlInteractive);
        sw.lblLevelTask.text(l.task);



        sw.lblLevelText.find("span").mousedown(function(){

            var oldspan = sw.spanID;
            sw.spanID = $(this).attr("id");
            var sense = E.graphSenses[sw.spanID];

            if(!$(this).hasClass("selected")){
                if(oldspan){
                    sw.lblLevelText.find("#" + oldspan).removeClass("selected");
                    for(var i =0;i< E.graphSenses.length;i++){
                        var span =$(sw.lblLevelText.find("span")[i]);
                        if(E.graphSenses[i]==sense){
                            $(span).removeClass("selected2");
                            if(span.hasClass("exists")){
                                $(span).removeClass("exists");
                                $(this).addClass("exists");
                            }

                        }
                    }
                }
                $(this).addClass("selected");
                $(this).addClass("selected2");
            }else if(!$(this).hasClass("exists")){
                $(this).removeClass("selected");
                $(this).removeClass("selected2");
            }

            sw.lblLevelGraphs.empty();

            //перебор доступных графем для добавления в панель
            if($.isArray(l.labels[sense])&&l.labels[sense][1]){
                //i - индекс крафемы
                for(var i = l.labels[sense][1].length; i--;){
                    var gSense =l.labels[sense][1][i];
                    sw.addToPanel(sense,gSense);
                }
            }
        }).each(
            function(){
                var spanID = $(this).attr("id");
                var sense = E.graphSenses[spanID];

                if($.isArray(l.labels[sense])&&l.labels[sense][1] && l.labels[sense][1].length ==1){
                    $(this).on("mousedown",function(e){
                        var ex = e.clientX, ey = e.clientY;

                        var spanID = $(this).attr("id");
                        var sense = E.graphSenses[spanID];
                        var gSense = l.labels[sense][1][0];
                        $('body').addClass('unselectable');
                        e.preventDefault();

                        function checkMouseMove(e){
                            if(Math.sqrt(Math.pow(e.clientX -ex ,2)+ Math.pow( e.clientY - ey ,2)) > 50 ){
                                $(document).unbind("mousemove", checkMouseMove);
                                SOKRAT.SensesFunction(E,e,e.clientX,e.clientY,sense,gSense);
                            }
                        }


                        function checkMouseUp(e){

                            $('body').removeClass('unselectable');
                            $(document).unbind("mousemove", checkMouseMove);
                            $(document).unbind("mouseup", checkMouseUp);
                        }

                        $(document).bind("mousemove", checkMouseMove);
                        $(document).bind("mouseup", checkMouseUp);


                    });
                }
            }
        );



        Scheme.update(sw.lblLevelText);

//        sw.lblLevelText.find("scheme")
//            .on("mousedown",function(e){
//                sw.spanID = $(this).parent().attr("id");
//                var sense = E.graphSenses[sw.spanID];
//                var gSense = l.labels[sense][1][0];
//                sw.foo(e,e.clientX,e.clientY,sense,gSense);
//
//            });

    },




    addToPanel: function (sense,gSense){

        var sw = this;
        var c = $("<div/>").css({float:"left",margin: "10px 0 0 10px"})[0];
        sw.lblLevelGraphs.append(c);

        new Scheme({
            data: E.level.graphs[gSense],
            container: c,
            width: 50,
            active: false,
            labels: false,
            datasource: E
        });


//        this.icecream = E.level.graphs[gSense];

       // touchstart, touchmove

        //$(document).bind("mousemove", OnMouseMove);

        SOKRAT.setSensesFunction(E,c,{sense: sense,graph: gSense});
    }

    
});

SOKRAT.SensesOnMove = function (sokrat,x,y){
    sokrat.drag_object.setPoint(0, x / sokrat.scale, y / sokrat.scale);
    sokrat.render.updateGraph(sokrat.drag_object,10);
    sokrat.render.update();
    return false;
};

SOKRAT.setSensesFunction = function(sokrat, object, options){
    (function(sokrat,object,options){
        object.onmousedown = function(e){
            event.preventDefault();
//            var btn = $(this).offset();
            var sokratOffset = $(sokrat.container).offset();
//            var x =  sokratOffset.left, y = btn.top - sokratOffset.top;
            SOKRAT.SensesFunction(sokrat,e.pageX,e.pageY,options,sokratOffset.left,sokratOffset.top);
        };
        object.addEventListener("touchstart",function (e){
            event.preventDefault();
            SOKRAT.SensesFunction(sokrat,e.changedTouches[0].clientX,e.changedTouches[0].clientY,options);
        },false);
    })(sokrat,object,options);
}

SOKRAT.SensesFunction = function(sokrat,x,y,options,offsetleft,offsettop){

    
    $('body').addClass('unselectable');



    //  sw.container.animate({opacity:0.2},500);
    $("#s_slide_panel").animate({opacity:0.2},500);


    sokrat.drag_object = sokrat.createGraph(options);

    sokrat.render.createGraphElement(sokrat.drag_object);

    sokrat.drag_object.setPoint(0, (x- offsetleft) / sokrat.scale, (y - offsettop) / sokrat.scale);
    sokrat.render.updateGraph(sokrat.drag_object,10);
    sokrat.render.update();

    sokrat.select(sokrat.drag_object);


    function OnMouseMove(e){
        SOKRAT.SensesOnMove(
            sokrat,
            e.pageX - offsetleft,
            e.pageY - offsettop
        );
    }


    function OnTouchMove(event){
        try{
            SOKRAT.SensesOnMove(sokrat,event.touches[0].pageX,event.touches[0].pageY);
        }catch(e){
            alert(e)
        }
    }
    // tell our code to start moving the element with the mouse

    function dragUp (event){
        //sw.container.animate({opacity:1},500);
        $("#s_slide_panel").animate({opacity:1},500);
        document.removeEventListener("mouseup", dragUp,false);
        document.removeEventListener("mousemove", OnMouseMove,false);
        document.removeEventListener("touchmove", OnTouchMove,false);
        document.removeEventListener("touchend", dragUp,false);

        sokrat.drag_object.onDrop(10);
        sokrat.onChange && sokrat.onChange();
        sokrat.render.updateGraph(sokrat.drag_object,0);
        $('body').removeClass('unselectable');
        //  drag_object.destroy();
    }

    document.addEventListener("mouseup", dragUp,false);
    document.addEventListener("mousemove", OnMouseMove,false);
    document.addEventListener("touchmove", OnTouchMove,false);
    document.addEventListener("touchend", dragUp,false);

    return false;
};