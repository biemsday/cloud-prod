document.addEventListener("DOMContentLoaded", addLoginForm);

function addLoginForm () {
    var authForm = document.createElement('div');
    authForm.id = "authForm";
    authForm.className = "authForm";
    authForm.innerHTML = "" +
        "<input type=\"text\" class=\"auth\" id=\"username\" placeholder=\"username\">\n" +
        "<input type=\"text\" class=\"auth\" id=\"password\" placeholder=\"password\">\n" +
        "<button class=\"auth\" id=\"loginButton\">Login</button>\n" +
        "<a class=\"auth\" id=\"registration\" href=\"#\">registration</a>";

    document.body.appendChild(authForm);

    var username = document.getElementById('username');
    var password = document.getElementById('password');

    loginButton.onclick = function () {
        socket.emit('login',{username:username.value,password:password.value});
    };

    socket.on('loginResponse',function(data){
        if(data.success){
            console.log("Sign in successul!");
            alert("Sign in successul!");
            removeLoginForm();
        } else {
            console.log("Sign in unsuccessul.");
            alert("Sign in unsuccessul.");
        }
    });

    registration.onclick = addRegistrationForm;
}

function removeLoginForm() {
    authForm.remove();
    let ctx = document.getElementById('ctx');
        ctx.style.visibility = 'visible';
    let ui = document.getElementById('ui');
        ui.style.visibility = 'visible';
}

function addRegistrationForm() {
    authForm.remove();
    document.body.className = "registration";
    var registrationForm = document.createElement('div');
    registrationForm.id = "registrationForm";
    registrationForm.className = "registrationForm";
    registrationForm.innerHTML = "" +
        "\t<button class=\"registration\" id=\"closeButton\">X</button>\n" +
        "\t<input type=\"text\" class=\"registration\" id=\"username\" placeholder=\"username\">\n" +
        "\t<input type=\"text\" class=\"registration\" id=\"password\" placeholder=\"password\">\n" +
        "\t<input type=\"text\" class=\"registration\" id=\"confirm\" placeholder=\"confirm password\">\n" +
        "\t<button class=\"registration\" id=\"registrationButton\">Registration</button>\n";

    document.body.appendChild(registrationForm);

    closeButton.onclick = function () {
        let registrationForm = document.getElementById("registrationForm");
        registrationForm.remove();
        document.body.className = "login";
        addLoginForm();
    };

    registrationButton.onclick = function () {

        var inputId = document.getElementsByTagName("input");
        var errorMsg = document.createElement("span");
            errorMsg.className = "errorMsg";
            errorMsg.id = "msg";

        for (i in inputId){
            if(inputId[i].className === "registration" && inputId[i].value === ""){
                errorMsg.innerText = "Please fill the form";
                inputId[i].className = "inputError";
                registrationForm.appendChild(errorMsg);
            } if (inputId[i].className === "inputError" && inputId[i].value !== "") {
                inputId[i].className = "registration";
                msg.remove();
                registrationForm.appendChild(errorMsg);
                errorMsg.innerText = "All is ok";
                errorMsg.className = "successMsg";
            }
        }
        var reg = 0;
        if(document.querySelector(".errorMsg") === null && reg !== 1){
            var reg = 1;
            console.log("reg")
        }
    }
}

// socket.emit('registration',{username:username.value,password:password.value});