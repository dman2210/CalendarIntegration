
var stateChanges = {
    original: function () {
        document.getElementById("main").style.flexDirection = "column";
        document.getElementById("calendar").style.display = "none";
        let buttons = document.getElementById("buttons").children;
        Array.from(buttons).forEach((button) => {
            button.style.display = "flex";
        });
        document.getElementById("label").innerText = "How Often?"
    },
}
window.onpopstate = function (event) {
    console.log("running state change")
    stateChanges[event.state.page]();
    hoursAvailable = event.state.hours;
}