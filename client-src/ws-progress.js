const webSocketPort = 3001;

$(document).ready(function(){
   if($("body").attr("class") === "emb-extr-body"){

       const extractingProgressBar = $("#extract-progress-bar");
       extractingProgressBar.css("width", 0);

       var socket = new WebSocket("ws://localhost:" + webSocketPort);

       // socket.onopen = function(){ //connect was created
       //     socket.send(" From client: start connection");
       //     console.log("connect was created");
       // };

       socket.onmessage = function(event){
           extractingProgressBar.css("width", event.data + "%");
       };

       $("#go-start-page").on("click", function () {
           socket.close();
       });

       // socket.onclose = function () {
       //     alert("Disconnected");
       // }
   }
});
