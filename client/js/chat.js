var chatText = document.getElementById("chatText");
var chatForm = document.getElementById("chatForm");
var chatInput = document.getElementById("chatInput");

socket.on('chatMsg',function(data){
    chatText.innerHTML += '<span>' + data + '</span>';
});
socket.on('evalAnswer',function(data){
    console.log(data);
});

chatForm.onsubmit = function(e){
    e.preventDefault();
    if(chatInput.value[0] === '/')
        socket.emit('evalServer',chatInput.value.slice(1));
    else
        socket.emit('sendMsgToServer',chatInput.value);
    chatInput.value = '';
}