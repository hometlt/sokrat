
$(function(){
    window.E = new Sokrat("canvas").setScale(0.8);

    window.I = Interface;
    window.R = E.paper;
    Interface.init(E);


    I.editor = new SokratEditor({
//        name:100,
//        category:-50,
//        difficulty:-50,
//        scenario:-50,
//        title:0,
//        task:0,
        interactive:0,
        graphs: 0,
        labels:0,
        process:0,
        elements:0,
        predefined: 0
        //savelist: "div"
    });

    I.editor.updateLevelList();

    API.levels_list(function(data){
        var _list =  data.list;

        for(var level in _list) {
//              0,1,33,50,54,66
            (function(level){
                var c = $("<div/>").addClass("paper").addClass("scheme").addClass("item").attr("data-level",level);
                $("#utasks").append(c);
                new Scheme({data:{load: _list[level].scheme}, scale: 0, labels: false, container: c[0]});
                c.click(function(){
                    API.levels_full(level,function(data){
                        I.levelname = data.id;
                        I.editor.loadData(data);
                    });
                });
            })(level)

        }
        $("#utasks").owlCarousel({
            navigation : true,
            items : 6, //10 items above 1000px browser width
            itemsDesktop : [1000,5], //5 items between 1000px and 901px
            itemsDesktopSmall : [800,4], // betweem 900px and 601px
            itemsTablet: [600,3], //2 items between 600 and 0
            itemsMobile : [450,2]
        });
    });

});