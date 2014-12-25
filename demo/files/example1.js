function canvas1(){
    new Sokrat("canvas1").setScale(1).load({
        "graphs":{
            "1":{"graph":"line"},
            "3":{"graph":"line-curve"},
            "2":{"graph":"block-ellipse","w":30,"h":30}
        },"elements":{
            "area":[null,"area",{"ps":[[317,170],[242,213],[241,126]],graph:"area"},{}],
            "block1": {c:[586,212],graph:2,rel:{"1":[["lineK2",3],["lineS2",1],["lineS2",4]]}},
            "block2": {c:[356,51] ,graph:2,rel:{"1":[["lineK1",1],["line6" ,2]]}},
            "block3": {c:[157,76] ,graph:2,rel:{"1":[["line10",1],["lineS1",1]]}},
            "block4": {c:[51,235] ,graph:2,rel:{"1":[["lineS1",4],["line10",4]]}},
            "block5": {c:[334,225],graph:2,rel:{"1":[["lineA1",3],["line6" ,1]]}},
            "blockA1":{c:[447,55] ,graph:2,rel:{"1":[["line2" ,1],["lineR1",1]]}},
            "blockT1":{c:[711,99] ,graph:2,rel:{"1":[["line7" ,1],["line5" ,2],["line4" ,2]]}},
            "lineS1":{"ps":[[142,72],[46,108],[127,191],[63,226]],graph:3},
            "lineS2":{"ps":[[579,198],[540,119],[527,209],[571,211]],graph:3},
            "lineK1":{"ps":[[354,65],[343,159],[404,235]],graph:3},
            "lineK2":{"ps":[[636,174],[634,208],[600,210]],graph:3},
            "lineR1":{"ps":[[461,56],[552,64],[430,146],[510,242]],graph:3},
            "lineA1":{"ps":[[424,103],[342,156],[338,210]],graph:3},
            "line10":{"ps":[[142,81],[87,107],[169,191],[65,236]],graph:3},
            "line2":{graph:1,"ps":[[446,69],[443,215]]},
            "line3":{graph:1,"ps":[[794,249],[749,252]]},
            "line4":{graph:1,"ps":[[623,113],[696,101]]},
            "line5":{graph:1,"ps":[[719,258],[711,113]]},
            "line6":{graph:1},
            "line7":{graph:1,"ps":[[725,98],[786,96]]}
        }
    });
}
canvas1();
var canvas1FunctionText = canvas1.toString();
$("#canvas1-code").text(canvas1FunctionText.slice(canvas1FunctionText.indexOf("{") + 1, canvas1FunctionText.lastIndexOf("}")));