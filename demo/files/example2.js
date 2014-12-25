function canvas2(){
    var canvas =  new Sokrat("canvas2").setScale(1).load({
        "graphs":{
            "1":{
                graph: "arrow" ,
                "attrs-area": {strokeWidth: 6,stroke : "#AD9944"},
                "attrs-draggers": {strokeWidth: 6,stroke: "#AD9944", lineWidth : 5}
            },
            "2":{
                "graph":"block-ellipse",
                "image":"star",
                "w":80,
                "h":80},
            "3":{
                "graph":"block-ellipse",
                "image":"star",
                "w":110,
                "h":110},
            "images":{"star":"img/star.png"}
        },
        "labels":{
            "1":["",[1]],
            "2":["Star",[2]]},
        "elements":{
            "block4": {c:[500,80],graph:2},
            "block2": {c:[200,130],graph:2},
            "block3": {c:[350,105],graph:2},
            "block1": {c:[50,105],graph:3},
            "block5": {c:[650,105],graph:3},
            "line1": {graph:1,rel:{"1":[["block1",1]],"2":[["block2",1]]}},
            "line2": {graph:1,rel:{"1":[["block2",1]],"2":[["block3",1]]}},
            "line3": {graph:1,rel:{"1":[["block3",1]],"2":[["block4",1]]}},
            "line4": {graph:1,rel:{"1":[["block4",1]],"2":[["block5",1]]}}
        }
    });
//    SOKRAT.setSensesFunction(canvas, document.getElementById("graph1"),{sense: 1,graph: 1});
    return canvas;
}
canvas2();
text = canvas2.toString();
$("#canvas2-code").text(text.slice(text.indexOf("{") + 1, text.lastIndexOf("}")));
