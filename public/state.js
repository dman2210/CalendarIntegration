
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
// let cleaningOptions = [
                            //     {
                            //         frequency: "One Cleaning",
                            //         price: 175,
                            //         note: "2 Hours",
                            //         short: "one",

                            //     },
                            //     {
                            //         frequency: "Monthly",
                            //         price: 175,
                            //         note: "2 Hours",
                            //         short: "monthly",
                            //     },
                            //     {
                            //         frequency: "Weekly",
                            //         price: 175,
                            //         note: "2 Hours",
                            //         short: "weekly"
                            //     },
                            //     {
                            //         frequency: "Bi-Weekly",
                            //         price: 175,
                            //         note: "2 Hours",
                            //         short: "biweekly"
                            //     }
                            // ]
                            // let buttons = cleaningOptions.map((option) => {
                            //     return (
                            //         `<button class="buttonAdapt" id="${option.short}" onClick=checkDates("${option.short}")>
                            //         <div>
                            //         <div style="display:flex;align-items: flex-start; flex-direction:column;margin-right:10vw;">
                            //             <div class="buttonItem serviceTitle">
                            //                 <h4 style="display:flex">
                            //                     ${option.frequency}
                            //                 </h4>
                            //             </div>
                            //             <div class="buttonItem">
                            //                 <p>
                            //                     $${option.price.toString()}.00 · ${option.note}
                            //                 </p>
                            //             </div>
                            //         </div>
                            //         </div>
                            //     </button>`)
                            // })
                            // document.getElementById("buttons").innerHTML = buttons;