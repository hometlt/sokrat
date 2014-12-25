
o = $;

// misc junk

o(function(){

    $("#content section h3").each(function(){
        var id = $(this).attr("id");
        $("#app-menu").append('<li><a href="#'+id + '">' + $(this).text()+ '</a></li>');
    });


    var width = window.innerWidth;
    var height = window.innerHeight;
    var doc = o(document);

    // .onload
    o('html').addClass('onload');

    // top link
    o('#top').click(function(e){
        o('body').animate({ scrollTop: 0 }, 'fast');
        e.preventDefault();
    });

    // scrolling links
    var added;
    doc.scroll(function(e){
        if (doc.scrollTop() > 5) {
            if (added) return;
            added = true;
            o('body').addClass('scroll');
        } else {
            o('body').removeClass('scroll');
            added = false;
        }
    })

    // highlight code
    o('pre.js code').each(function(){
        o(this).html(highlight(o(this).text()));
    })
})

o(function(){
    var prev;
    var n = 0;


// active menu junk
    window.App = {
        headings : {},
        updateHeadings: function(){
            App.headings = o('h3').map(function(i, el){
                return {
                    top: o(el).offset().top,
                    id: el.id
                }
            });
        },

        closest: function() {
            var h;
            var top = o(window).scrollTop();
            var i = App.headings.length;
            while (i--) {
                h = App.headings[i];
                if (top >= h.top) return h;
            }
        }

    };

    App.updateHeadings();

    o(document).scroll(function(){
        var h = App.closest();
        if (!h) return;

        if (prev) {
            prev.removeClass('active');
            prev.parent().parent().removeClass('active');
        }

        var a = o('a[href="#' + h.id + '"]');
        a.addClass('active');
        a.parent().parent().addClass('active');

        prev = a;
    })
});

/**
 * Highlight the given `js`.
 */

function highlight(js) {
    return js
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\/\/(.*)/gm, '<span class="comment">//$1</span>')
        .replace(/('.*?')/gm, '<span class="string">$1</span>')
        .replace(/(\d+\.\d+)/gm, '<span class="number">$1</span>')
        .replace(/(\d+)/gm, '<span class="number">$1</span>')
        .replace(/\bnew *(\w+)/gm, '<span class="keyword">new</span> <span class="init">$1</span>')
        .replace(/\b(function|new|throw|return|var|if|else)\b/gm, '<span class="keyword">$1</span>')
}
