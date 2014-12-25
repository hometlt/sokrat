function Slides(el){
    this.el = el;
    this.slide = 0;
    var P = this;

    //this._bindFoo  = function(event){P.bindKey(event.which);};
}

Slides.prototype.finish = function(){
    var P =this;
    this.length = P.el.find("article").length;
        $("#slide_all").text(this.length);
    P.addPrettify();
    Scheme.update(P.el);
    $("#x-left").click(function(){P.select(--P.slide)});
    $("#x-right").click(function(){P.select(++P.slide)});
};

Slides.prototype.load = function(url,page){
    var P=this;
    $(document).unbind("keydown",this._bindFoo);
    P.el.find("article").remove();
    this.url= url;
    $.ajax({
        url: url,
        success: function(data){
            P.slides={};
            P.el.append(data);

            function makelink(alt,pagenum){
                P.el.find("#maintenance").append(
                    $("<a/>").text(alt).click(function(){
                        P.select(pagenum);
                    }),$("<br/>")
                );
            }
            var pagenum=0;
            P.el.find("article").each(function(){
                var alt =$(this).attr('alt');
                if(alt){
                    $(this).prepend($("<h3/>").text(alt));
                    makelink(alt,pagenum);
                }pagenum++;
            });
            P.finish();
            P.select(page-1||0);
        },
        cache: false
    });
    return this;
};


Slides.prototype.addPrettify = function () {
    var els = document.querySelectorAll('pre');
    for (var i = 0, el; el = els[i]; i++) {
        if (!el.classList.contains('noprettyprint')) {
            el.classList.add('prettyprint');
        }
    }
    prettyPrint();
};


Slides.prototype.show = function(){
    $(document).bind("keydown",this._bindFoo);
    this.el.show();

};

Slides.prototype.hide = function(){
    $(document).unbind("keydown",this._bindFoo);
    this.el.hide();
};


Slides.prototype.makeSlides = function( url , page ){
    this.load(url + ".html",page);
    this.show();
    this.url = url;
};


Slides.prototype.select = function(num){
    if(num>=this.length){
        num = 0;
    }else if(num<0){
        num = this.length-1;
    }
    this.slide=num;
    this.el.find("article").hide();
    $(this.el.find("article")[this.slide]).show().focus();
    $("#slide_current").text(this.slide+1);
    $.history.load(["slides",this.url,this.slide+1].join("/"));
};

Slides.prototype.bindKey = function (keycode){
        switch (keycode) {
            case 39: // right arrow
           // case 13: // Enter
           // case 32: // space
          //  case 34: // PgDn
                this.select(++this.slide);
                break;

            case 37: // left arrow
           // case 8: // Backspace
           // case 33: // PgUp
                this.select(--this.slide);
                break;

         /*   case 40: // down arrow
                if (isChromeVoxActive()) {
                    speakNextItem();
                } else {
                    nextSlide();
                }
                break;

            case 38: // up arrow
                if (isChromeVoxActive()) {
                    speakPrevItem();
                } else {
                    prevSlide();
                }
                break;*/
        }

};



/**
 * создание списка графем для презентации
 */
Slides.prototype.makeGraphList = function(){

    var P = this;
    $.ajax({
        cache: false,
        url: "graphs.json",
        type: 'POST',
        dataType: 'json',
        success: function(data) {

            P.el.find("article").remove();
            for(var page=0;page< data.length;page++){
                var article = $("<article/>").append($("<h3/>").text(data[page][0]));
                P.el.append(article);

                for(var i=1;i< data[page] .length;i+=2){
                    if(data[page][i]){
                        var container =  $("<scheme/>").css({background:"gray","border-radius":10,float:"left",margin: 5});
                        article.append(container);
                        new Scheme({
                            data: data[page][i],
                            width: 80,
                            height: 80,
                            container: container[0]
                        });
                    }
                    if(data[page][i+1]){
                        var description = data[page][i+1].replace(/\{(.*?)\}/gm,function(args){
                            var type = args.substring(1,args.indexOf(' '));
                            var text =  args.substring(args.indexOf(' '),args.length-1);
                            return  '<span class="red">{0}</span>'.$(text);
                        });
                    }

                    article.append($("<div/>").html(description)).append($("<hr/><div style='clear:both'></div>"));
                }
            }
            P.select(0);
        },
        error: function(jqXHR, textStatus, errorThrown) { alert(textStatus + ": "+ errorThrown); callback(null); }
    });
    P.show();
};