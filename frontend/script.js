const app = 'NodeJS';
var colors = [
    '#46BFBD', // GREEN
    '#6435C9', // VIOLET
    '#ff6384', // RED
    '#FDB45C', // ORANGE
    '#45b7cd' // BLUE
];
$(document).ready(function() {

    var users = [];

    var room = prompt("Room name", "Room 1");
    if (room == null || room === '') {
        room = "Room 1";
    }

    $('.title').html(room);

    var name = prompt("User name", "user1");
    if (name == null || name === '') {
        name = "user1";
    }

    const websocket = io();

    websocket.emit('new-user', {
        name: name,
        room: room
    });

    websocket.on('system-message', (msg) => {
        $('.messages').append("<div class=\"system_msg\">" + msg.message + "</div>");
        scrollTop()
    })

    websocket.on('message', (msg) => {

        console.log(msg);

        var color = getColor(msg.name);

        var $message = $('.message_template .message').clone();
        $message.addClass(msg.name == name ? 'right' : 'left').find('.text').html(msg.message);
        if (msg.name != name) {
            $message.find('.user_name').html(msg.name);
            $message.find('.user_name').css("color", color)
        }
        $('.messages').append($message);

        setTimeout(function() {
            $message.addClass('appeared');
        }, 0);
        scrollTop()
    });

    $(document).keypress(function(e) {
        if (e.which == 13) sendMessage();
    });

    $('.send_message').click(sendMessage);

    function sendMessage() {
        var message = $('.message_input').val();
        if (message == "") return;
        websocket.emit('message', {
            message: message,
            name: name,
            room: room
        });
        $('.message_input').val('');
    }

    function getColor(_name) {
        if (_name == name) return;
        var index = users.indexOf(_name);
        if (index == -1) {
            users.push(_name);
            index = users.indexOf(_name);
        }
        return colors[index % colors.length]
    }

    function scrollTop() {
        $('.messages').animate({
            scrollTop: $('.messages').prop('scrollHeight')
        }, 300);
    }

});