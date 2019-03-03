var ctx = document.getElementById('ctx').getContext('2d');

var socket = io();

socket.on('newPositions', function (data) {
    ctx.clearRect(0,0,500,500);
    for (var i = 0; i < data.length; i++) {
        ctx.fillText(data[i].number,data[i].x,data[i].y);
    }
});

//keyboard

document.onkeydown = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('keyPress',{inputId:'right',state:true});
    else if(event.keyCode === 83)   //s
        socket.emit('keyPress',{inputId:'down',state:true});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:true});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:true});

}
document.onkeyup = function(event){
    if(event.keyCode === 68)    //d
        socket.emit('keyPress',{inputId:'right',state:false});
    else if(event.keyCode === 83)   //s
        socket.emit('keyPress',{inputId:'down',state:false});
    else if(event.keyCode === 65) //a
        socket.emit('keyPress',{inputId:'left',state:false});
    else if(event.keyCode === 87) // w
        socket.emit('keyPress',{inputId:'up',state:false});
}

//joystick

const joystick = createJoystick(document.getElementById('stick'));

function createJoystick(parent) {
    const maxDiff = 50;
    const stick = document.createElement('div');
    stick.classList.add('joystick');

    stick.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    stick.addEventListener('touchstart', handleMouseDown);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    let dragStart = null;
    let currentPos = { x: 0, y: 0 };

    function handleMouseDown(event) {
        stick.style.transition = '0s';
        if (event.changedTouches) {
            dragStart = {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY,
            };
            return;
        }
        dragStart = {
            x: event.clientX,
            y: event.clientY,
        };
    }

    function handleMouseMove(event) {
        if (dragStart === null) return;
        event.preventDefault();

        if (event.changedTouches) {
            event.clientX = event.changedTouches[0].clientX;
            event.clientY = event.changedTouches[0].clientY;
        }

        const xDiff = event.clientX - dragStart.x;
        const yDiff = event.clientY - dragStart.y;
        const angle = Math.atan2(yDiff, xDiff);
        const distance = Math.min(maxDiff, Math.hypot(xDiff, yDiff));
        const xNew = distance * Math.cos(angle);
        const yNew = distance * Math.sin(angle);
        stick.style.transform = `translate3d(${xNew}px, ${yNew}px, 0px)`;
        currentPos = { x: xNew, y: yNew };

        const dir = parseFloat(angle).toFixed(0);

        joystickMove(dir);
    }

    function handleMouseUp(event) {
        if (dragStart === null) return;
        stick.style.transition = '.2s';
        stick.style.transform = `translate3d(0px, 0px, 0px)`;
        dragStart = null;
        currentPos = { x: 0, y: 0 };

        socket.emit('keyPress',{inputId:'left',state:false});
        socket.emit('keyPress',{inputId:'right',state:false});
        socket.emit('keyPress',{inputId:'down',state:false});
        socket.emit('keyPress',{inputId:'up',state:false});
    }

    parent.appendChild(stick);
    return {
        getPosition: () => currentPos,
    };

    function joystickMove(dir) {
        if(dir === "0"|| dir === "-0" || dir === "-1" || dir === "1"){
            socket.emit('keyPress',{inputId:'right',state:true});
        } else {
            socket.emit('keyPress',{inputId:'right',state:false});
        }
        if(dir === "3"|| dir === "-3" || dir === "-2" || dir === "2"){
            socket.emit('keyPress',{inputId:'left',state:true});
        } else {
            socket.emit('keyPress',{inputId:'left',state:false});
        }
        if(dir === "-2"|| dir === "-1" || dir === "-3"){
            socket.emit('keyPress',{inputId:'up',state:true});
        } else {
            socket.emit('keyPress',{inputId:'up',state:false});
        }
        if(dir === "2"|| dir === "1" || dir === "3"){
            socket.emit('keyPress',{inputId:'down',state:true});
        } else {
            socket.emit('keyPress',{inputId:'down',state:false});
        }
    }
}

