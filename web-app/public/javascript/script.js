$(function () {
    "use strict";
    var arduinosContainer = $("#arduinos");
    var alertsContainer = $("#alerts");
    setInterval(function(){
        $.get("/arduinos", function (data){
            arduinosContainer.html("");
            $("#connected").text(data.length);
            data.forEach(function (arduino) {
                arduinosContainer.append("<h3>id: " + arduino.id + "</h3>");
                arduinosContainer.append("<p>temperature: " + arduino.temperature + "C</p>");
                arduinosContainer.append("<p>pH: " + arduino.pH + "</p>");
            });
        });

    }, 3000);

    SocketIO.on("alert", function (msg) {
        var dateStr = new Date(Date.now()).toLocaleString();
        alertsContainer.prepend("<p>" + dateStr + ": "  + msg + "</p>")
    });
});