$("#embed-form").on("submit", function (event) {
    event.preventDefault();
    $("#result-image-div").empty();

    var imageFile = $("input[name='image-file']");
    if(imageFile.val() == ""){
        alert("Image file wasn't selected");
        return false;
    }

    var message = $("input[name='message']").val();
    if(message == ""){
        alert("Message is absent");
        return false;
    }

    //get data from form inputs for AJAX request
    var embedForm = $("#embed-form")[0];
    var fd = new FormData(embedForm);

    $.ajax({
        url: $(this).attr("action"),
        type: "post",
        processData: false,
        contentType: false,
        data: fd,
        success: function(data){
            var embeddingResultDiv = $("#embedding-result-div");
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

    var imageFile = $("input[name='image-file2']");
    if(imageFile.val() == ""){
        alert("Image file wasn't selected");
        return false;
    }

    //get data from form inputs for AJAX request
    var extrForm = $("#extract-form")[0];
    var fd = new FormData(extrForm);

    $.ajax({
        url: $(this).attr("action"),
        type: "post",
        processData: false,
        contentType: false,
        data: fd,
        success: function(data){
            var extractedMessageDiv = $("#extracted-message-div");
            extractedMessageDiv.html(data);
            extractedMessageDiv[0].scrollIntoView();
        },
        error: function () {
            $("#extracted-message-div").text("Error");
            window.scrollTo(0,document.body.scrollHeight);
        }
    });
});
