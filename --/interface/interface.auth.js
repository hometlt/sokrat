
function WindowAuth(container){
    var W = this;


    function doit(){//todo переименовать

        W.login_mess = W.container.find();
        W.login_name =  W.container.find("#login"); // $("<input/>").attr({placeholder:"Name",type:"text",value:"user" });
        W.login_pass = W.container.find("#password");  //$("<input/>").attr({placeholder:"Password_12345",type:"password",value:"user" });
        W.login_btn = W.container.find("#submit");  //$("<a/>").attr({class:"st-button"}).text("Войти");

        W.trybtn = W.container.find("#try").click(function(){W.auth("newuser","newuser");});

        W.authorizing = false;
        W.login_btn.click(function(e){
            e.preventDefault();
            W.auth(W.login_name.val(),W.login_pass.val());
        });
        // W.container.append(W.login_mess).append(W.login_name).append(W.login_pass).append(W.login_btn);

    }


    if(container){
        this.container = container;
        doit();
    }else{
        this.container =  $("<div/>").css({top:0, bottom:0,left: 50, height:200,width:250, position:"absolute", margin: "auto"}).hide();
        $("body").append(W.container);
        this.container.load("login.html",doit);
    }

}

mixin(WindowAuth.prototype, {


    onAuth: function(){
        I.auth.hide();
        I.account.show();
        API.updateUserInfo(function(info){
            //$("#api_small").show();
            $("#api_user_name"/*,#api_user_name_small"*/).text(info.name);
            $("#api_user_status").text(info.status);

            $("#api_user_image"/*,#api_user_image_small"*/).attr("src","img/users/" + info.image);

            $("#api_logout").click(function(){
                API.auth_logout(function(){
                    //$("#api_small").hide();
                    I.auth.show();
                    I.account.hide();
                });
                return false;
            });

        });
    },

    toggle: function(){
        if(this.visible)this.hide();else this.show();
    },

    show: function(){
        this.visible = true;
        this.container.show();
    },
    hide: function(){
        this.visible = false;
        this.container.hide();
    },

    auth: function (login, password){
        var W=this;
        if(W.authorizing)return;
        W.authorizing = true;
        W.login_btn.text("авторизация...");


        API.auth_login(login, password,function(data){
            if(data){
                if(data.error){
                    alert("Логин или Пароль не верны");
                }else{
                    W.hide();
                    W.onAuth();
                }
            }else{
                alert("ERROR");
            }
            W.login_btn.text("Войти");
            W.authorizing = false;
        });
    }

});