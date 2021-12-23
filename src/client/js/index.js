const { ipcRenderer } = require("electron")
const $ = require("jquery");

// Buttons
const btn_addDM = document.getElementById("add-dm-btn");
const btn_execute = document.getElementById("start-btn");


// Inputs
const in_user = document.getElementById("inUser");
const in_pass = document.getElementById("inPass");
const in_proxy = document.getElementById("inProxy");
const in_dmc = document.getElementById("dm-content-input");


// Helper Functions
function setStatus(type, message, new_progress) {
    if(type) {
        $("#status-type").html(`${type}:`);
    }

    if(message) {
        $("#status-text").html(message);
    }

    if(new_progress) {
        if($("#status-bar").hasClass("hidden")) {
            $("#status-bar").removeClass("hidden");
        }
        
        $("#status-bar").attr("style", `width: ${new_progress};`)
    }
}


// Events
$(btn_addDM).on("click", () => {
    if($("#dm-content-input").val() === "" || $(btn_execute).data("state") === "stop") return;

    let clone = $("#templates > .dm-item").clone();
    $(clone).find(".dm-content").html($("#dm-content-input").val());

    $(clone).find(".del-dm-content").click(() => {
        if($(btn_execute).data("state") === "start") { 
            $(clone).remove();
            if($(".dm-list").children().length == 1) {
                $("#dm-list-none-indicator").removeClass("hidden");
            }
        } 
    });

    $(clone).appendTo(".dm-list");
    $("#dm-list-none-indicator").addClass("hidden");

    $("#dm-content-input").val("");
    $("#dm-content-input").focus();
});

$(btn_execute).on("click", () => {
    if($(btn_execute).data("state") === "start") {
        // start button

        const username = $(in_user).val();
        const password = $(in_pass).val();
        const proxy = $(in_proxy).val();
        const dms_elements = Array.from($(".dm-list > .dm-item"));
        const dms = dms_elements.map((e) => $(e).find(".dm-content").html());

        if(!!!username || !!!password || dms.length === 0) {
            return setStatus("Error", "Make sure to fill in all required fields.");
        }

        $(btn_execute).removeClass("btn-primary");
        $(btn_execute).addClass("btn-danger");
        $(btn_execute).html("Stop");
        $(btn_execute).data("state", "stop")

        $(in_user).prop("disabled", true);
        $(in_pass).prop("disabled", true);
        $(in_proxy).prop("disabled", true);
        $(in_dmc).prop("disabled", true);

        setStatus("Status", "Attempting login...");

        ipcRenderer.send("execute", { ig: { username, password }, dm_content: dms, proxy_url: proxy });
    } else {
        // stop button
        $(btn_execute).removeClass("btn-danger");
        $(btn_execute).addClass("btn-primary");
        $(btn_execute).html("Start");
        $(btn_execute).data("state", "start");

        $(in_user).prop("disabled", false);
        $(in_pass).prop("disabled", false);
        $(in_proxy).prop("disabled", false);
        $(in_dmc).prop("disabled", false);
    }
})

ipcRenderer.on("execute-reply", (event, status) => {
    console.log(status);

    if(!status.success) {
        if(status.msg == "LOGIN") {
            setStatus("Error", "Failed to login (check credentials, alternatively try using a proxy).");

            $(btn_execute).addClass("btn-primary");
            $(btn_execute).removeClass("btn-danger");
            $(btn_execute).html("Start");
            $(btn_execute).data("state", "start")
    
            $(in_user).prop("disabled", false);
            $(in_pass).prop("disabled", false);
            $(in_proxy).prop("disabled", false);
            $(in_dmc).prop("disabled", false);
        }
    } else {
        setStatus("Status", "Sending DMs as we speak!");
    }
})