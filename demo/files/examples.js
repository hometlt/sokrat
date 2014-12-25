

$(function() {
    var levels = [];
    $("#tasks .scheme").each(function () {
        var id = this.id, level = id.substr(id.indexOf("_") + 1);
        var section = $(this).parents('section')[0];

        levels.push(level);

    });


    API.levels_multiple(levels, function (levels_data) {

//                    if(!data){
//                        $(section).addClass("failed");
//                        return;
//                    }

        for (var level in levels_data) {
            if (!levels_data[level])continue;

            (function processLevel() {
                var data = levels_data[level];
                var id = "canvas_" + level;
                App.updateHeadings();
                var levelObject = API.evalLevel(data);
                var e = new Sokrat(id).load(API.evalLevel(data));//.setScale("auto");

                var instructions = API.decodeData(data["process"]);

                var code = $("#code_" + level);

                function check(el, showmessages) {
                    if (showmessages == undefined) showmessages = true;
                    e.process();
                    var data = Checker.checkOut(SOKRAT.getGraphArray(levelObject.graphs, e.getGraphData()), instructions);
                    el.text(data.values.status);
                    el.css("background", data.values.status < 100 ? "red" : "grey");

                    if (showmessages) {
                        var showResultsMsg = function (messages, text, style) {
                            for (var i = 0; i < messages.length; i++) {
                                code.append($("<span/>").addClass(style), $("<span/>").append(text + " " + messages[i]), $("<br/>"));
                            }
                        };

                        code.empty();

                        showResultsMsg(data.messages.E, "Ошибка:", "critical");
                        showResultsMsg(data.messages.W, "Предупреждение:", "warning");
                        showResultsMsg(data.messages.N, "Замечание:", "notice");
                        showResultsMsg(data.messages.M, "Сообщение:", "message");

                        var text = "", classname = "";
                        if (data.values.status == 100) {
                            text = "Задача выполнена на отлично!";
                            classname = "message";
                        }
                        else if (data.values.status > 85) {
                            text = "Задача выполнена хорошо";
                            classname = "notice";
                        }
                        else if (data.values.status > 70) {
                            text = "Задача выполнена с предупреждениями";
                            classname = "warning";
                        }
                        else {
                            text = "Задача не выполнена.";
                            classname = "critical";
                        }

                        text = "Результат: " + data.values.status + " " + text;

                        code.append($("<p/>").html(text).addClass(classname));
                    }

                }

                var x = $("<div/>").addClass("checkbutton").click(function () {
                    check($(this))
                });

                $("#" + id).append(x);

                check(x, false);

                var text_data = [];
                for (var field in data) {
                    var _field_data = highlight(data[field]).replace(/\n/g, "<br/>  ");
                    switch (field) {
                        case "name":
                        case "credit":
                        case "title":
                        case "task":
                            text_data.push(field + ": \"" + _field_data + "\"");
                            break;
                        case "id":
                        case "category":
                        case "difficulty":
                        case "scenario":
                            text_data.push(field + ": " + _field_data);
                            break;
                        case "interactive":
                            _field_data = data[field].replace(/\n/g, "\",<br/>  \"");
                            text_data.push(field + ": [<br/>  \"" + _field_data + "\"</br>]");
                            break;
                        case "graphs":
                        case "labels":
                        case "elements":
                        case "process":
                        case "predefined":
                            text_data.push(field + ": {<br/>  " + _field_data + "</br>}");
                    }

                }

                code.append($("<code/>").html(text_data.join(",<br/>")));//.addClass('prettyprint');
                var section = $("#" + id).parents('section')[0];
                $(section).addClass("loaded");
            })(level);
        }
//                        $("#code_" + level).html(
//
//                        [
//                            "xOffset: " +e.xOffset ,    "yOffset: " + e.yOffset,
//                            "width: " +e.width ,        "height: " + e.height,
//                            "scale" + e.scale ,
//                            "bbox" + $.toJSON(e.getBounds())].join("<br/>"));

//
//                        var bbox = this.getBounds();
//                        this.scale = scale;

//                        el.html(el.html().replace(/<[/]*span[\sa-z"=]*>/g,""));
//                        el.addClass('prettyprint');
//                        prettyPrint();
    });

})