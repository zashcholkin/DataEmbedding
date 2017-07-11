$("#emb-btn").on("click", function () {
    $("#emb-div").show();
    $("#go-start-page").show();
    $("#extr-div").hide();
    $("#start-div").hide();
    $("#image-before-embedding").hide();
});

$("#extr-btn").on("click", function () {
    $("#extr-div").show();
    $("#go-start-page").show();
    $("#emb-div").hide();
    $("#start-div").hide();
});

$("#go-start-page").on("click", function () {
    $("#start-div").show();
    $("#emb-div").hide();
    $("#extr-div").hide();
    $("#go-start-page").hide();
});

$("#emb-image-file").on("change", function () {

    var reader = new FileReader();
    reader.onload = function(e){
        $("#image-before-embedding")
            .show()
            .attr("src", e.target.result);
    };

    reader.readAsDataURL(this.files[0]);
});


var colorChannelDiv = $("#color-channel-div");
$("input[name='color-channel']").on("change", function () {
    switch ($("input[name='color-channel']:checked").val()){
        case "r":
            colorChannelDiv.css("background-color", "darkred");
            break;
        case "g":
            colorChannelDiv.css("background-color", "yellowgreen");
            break;
        case "b":
            colorChannelDiv.css("background-color", "darkblue");
            break;
    }
});

$("input[name='interval-mode']").on("change", function () {
    $(".interval-mode-select > .substep-header").css("background-color", "whitesmoke");
    $(".interval-mode-select input[type='number']").prop("disabled", true);

    $(this).parents(".substep-header").css("background-color", "lemonchiffon");
    if($(this).val() == "fixed"){
        $("input[name='finterval-amount']").prop("disabled", false);
    } else if($(this).val() == "random"){
        $("input[name='rinterval-min']").prop("disabled", false);
        $("input[name='rinterval-max']").prop("disabled", false);
        $("input[name='rinterval-seed']").prop("disabled", false);
    }
});