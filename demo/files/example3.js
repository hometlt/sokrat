
function canvas3(){
    var canvas =  new Sokrat("canvas3").setScale(1);
    canvas.onload = function(){
        $("#canvas3-container [data-action=delete]").click(function(e){
            canvas.selGraph ? canvas.remove(canvas.selGraph): canvas.clear();
            e.preventDefault();
        });


        $("#canvas3-container [data-graph]").each(function(){
            var template = $(this).attr("data-graph");
            SOKRAT.setSensesFunction(canvas, this,{graph: template});

            new Scheme({
                data: canvas.level.graphs[template],
                container: this,
                width: 38,
                datasource: canvas
            });
        });
    };

    canvas.load({
        "graphs":{
            "1":{graph:"arrow"},
            "2":{graph:"ellipse","image":"star",   "w":80,"h":80},
            "3":{graph:"ellipse","image":"beer",   "w":80,"h":80},
            "4":{graph:"ellipse","image":"pumpkin","w":80,"h":80},
            "5":{graph:"ellipse","image":"gift",   "w":80,"h":80},
            "6":{graph:"ellipse","image":"monster",   "w":80,"h":80},
            "images":{
                star:     "img/star.png",
                monster: "img/monster.png",
                pumpkin: "img/pumpkin.png",
                gift: "img/gift.png",
                beer:     "img/beer.png"
            }
        }
    });


    return canvas;
}
var canvas =  canvas3();
var text = canvas3.toString();
$("#canvas3-code").text(text.slice(text.indexOf("{") + 1, text.lastIndexOf("}")));

var rules = {
    rule1:   {e: ".D len(* .D,3)", "1:":"G"}
};
var callback = function callback1(){
    $("#canvas3-container [data-graph]").not("[data-graph=1]").hide();
    $("#canvas3-container .task-description").append(
        $("<br/><span class='green'>Выполнено</span><br/>" +
            "<span>Соедините стрелками эти три графемы</span><br/>" +
            "<span>Используется проверка <code>!.1 .Q $A > > .Q > > .Q !$A</code></span>"));
    callback = callback2;
    rules = {
        rule2:   {e: "not(.1) .Q $A > > .Q > > .Q not($A)","1:": "G"}
        //rule5:   {e: ".F not(.1) > > .F > > .F",1: "G"}
    };
};
function callback2(){
    $("#canvas3-container [data-graph]").not("[data-graph=1]").hide();
    $("#canvas3-container .task-description").append($("<br/><span class='green'>Выполнено</span>"));
    canvas.onChange = false;
}
canvas.onChange = function(){
    var data = canvas.checkOut(rules);
    if(data.values.status == 100)callback();
    $("#task-1").empty();
    for(var i in data.messages){
        $("#task-1").append(data.messages[i]);
    }
};
