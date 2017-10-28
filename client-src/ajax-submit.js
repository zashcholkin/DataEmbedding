const $ = require("jquery");

$("#embed-form").on("submit", function (event) {
    event.preventDefault();
    $("#result-image-div").empty();

    //checking presence of data before sending to the server
    const imageFile = $("input[name='image-file']");
    if(imageFile.val() === ""){
        alert("Image file wasn't selected");
        return false;
    }

    const message = $("input[name='message']").val();
    if(message === ""){
        alert("Message is absent");
        return false;
    }

    //get data from form inputs for AJAX request
    const embedForm = $("#embed-form")[0];
    const fd = new FormData(embedForm);

    const loaderDiv = $(".loader");

    $.ajax({
        url: $(this).attr("action"),
        type: "post",
        processData: false,
        contentType: false,
        data: fd,
        beforeSend: function(){
            loaderDiv.show();
            loaderDiv[0].scrollIntoView();
        },
        success: function(data){
            loaderDiv.hide();
            const embeddingResultDiv = $("#embedding-result-div");
            embeddingResultDiv.html(data);
            embeddingResultDiv[0].scrollIntoView();
        },
        error: function () {
            $("#embedding-result-div").text("Error");
            window.scrollTo(0,document.body.scrollHeight);
        }
    });
});


$("#extract-form").on("submit", function (event) {
    event.preventDefault();

    //checking presence of image before sending to the server
    const imageFile = $("input[name='image-file2']");
    if(imageFile.val() === ""){
        alert("Image file wasn't selected");
        return false;
    }

    //get data from form inputs for AJAX request
    const extrForm = $("#extract-form")[0];
    const fd = new FormData(extrForm);

    $.ajax({
        url: $(this).attr("action"),
        type: "post",
        processData: false,
        contentType: false,
        data: fd,
        success: function(data){
            const extractedMessageDiv = $("#extracted-message-div");
            extractedMessageDiv.html(data);
            extractedMessageDiv[0].scrollIntoView();
        },
        error: function () {
            $("#extracted-message-div").text("Error");
            window.scrollTo(0,document.body.scrollHeight);
        }
    });
});
