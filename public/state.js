var toDo = [];
function goTo(state, data) {
    let stateMap = {
        calendar: {
            do: () => { checkDates(data.frequency) },
            statusId: "calendarStatus",
            step: 1
        }
    }
    let newState = stateMap[state];
    newState.do();
    changeStatus(newState.statusId);
    if (!newState === 1) {
        document.getElementById("backButton").style.display = "inline-block"
    }
}
function checkDates(frequencyChoice) {
    document.getElementById("loaderContainer").style.display = "flex";
    document.subOptions = { frequency: frequencyChoice };
    //implement conflict checking
    document.getElementById("calendar").style.display = "flex";
    // let title = document.getElementById('title').cloneNode(true);
    document.getElementsByClassName("buttonsContainer")[0].style.display = "none";

    // history.pushState({ page: "calendaropened", busyHours: hoursBusy }, "", "");
    if (!hoursBusyResolved||!availableHoursResolved) {
        toDo.push(() => { filterByFrequency(frequencyChoice); });
        toDo.push(() => { disableBookedDays((new Date()).getMonth()); });
        toDo.push(() => { hideLoader(); });
    } else {
        filterByFrequency(frequencyChoice);
        disableBookedDays((new Date()).getMonth());
        hideLoader();
    }
}

function changeStatus(statusId) {
    Array.from(document.getElementById("label").children).forEach(
        (status) => {
            if (status.id === statusId) {
                status.classList.add('activeStatus');
            } else {
                status.classList.remove('activeStatus')
            }
        }
    );
}
async function waitForHours() {
    if (!hoursBusyResolved) {
        if (typeof (hoursBusy) !== undefined && 'hoursBusy' in window) {
            await hoursBusy;
        } else {
            await exponentialWait(waitForHours(), 1);
        }
    }
    return;
}
function hideLoader() {
    document.getElementById("loaderContainer").style.display = "none";

}

async function exponentialWait(func, time) {
    await setTimeout(func, time * 2);
}

// var stateChanges = {
//     original: function () {
//         document.getElementById("main").style.flexDirection = "column";
//         document.getElementById("calendar").style.display = "none";
//         let buttons = document.getElementById("buttons").children;
//         Array.from(buttons).forEach((button) => {
//             button.style.display = "flex";
//         });
//         document.getElementById("label").innerText = "How Often?"
//     },
// }
// window.onpopstate = function (event) {
//     console.log("running state change")
//     stateChanges[event.state.page]();
//     hoursAvailable = event.state.hours;
// }
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