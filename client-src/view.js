var $ = require("jquery");
require("./css/start-page.css");
require("./css/emb-extr-pages.css");

$("#go-start-page").on("click", function () {
    window.location = "/";
});

$("#image-file-input").on("change", function () {

    var reader = new FileReader();
    reader.onload = function(e){
        $("#emb-extr-img")
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