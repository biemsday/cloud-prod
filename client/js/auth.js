document.addEventListener("DOMContentLoaded", addLoginForm);

function addLoginForm () {
    var authForm = document.createElement('div');
    authForm.id = "authForm";
    authForm.className = "authForm";
    authForm.innerHTML = "" +
        "<input type=\"text\" class=\"auth\" id=\"user\" placeholder=\"username\">\n" +
        "<input type=\"text\" class=\"auth\" id=\"pass\" placeholder=\"password\">\n" +
        "<button class=\"auth\" id=\"login\">Login</button>\n" +
        "<a class=\"auth\" id=\"registration\" href=\"#\">registration</a>";

    document.body.appendChild(authForm);

    var user = document.getElementById('user');
    var pass = document.getElementById('pass');

    login.onclick = function () {
        socket.emit('login',{username:user.value,password:pass.value});
    };
    socket.on('loginResponse',function(data){
        if(data.success){
            alert("Sign in successul!");
            removeForm();
        } else {
            alert("Sign in unsuccessul.");
        }
    });
}

function removeForm() {
    authForm.remove();
    let ctx = document.getElementById('ctx');
        ctx.style.visibility = 'visible';
    let ui = document.getElementById('ui');
        ui.style.visibility = 'visible';
}