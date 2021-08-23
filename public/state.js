window.onpopstate = function (event) {
    // console.log(event.state)
    if (event.state) {
        goTo(event.state.page, event.state.data, true);
    }
}

var toDo = [];
function goTo(state, data, block) {
    let stateMap = {
        original: {
            do: () => { showBeginning(block) },
            statusId: "frequencyStatus",
            step: 1
        },
        calendar: {
            do: () => { checkDates(data.frequency, block) },
            statusId: "calendarStatus",
            step: 2
        },
        form: {
            do: () => { goToQuestionForm(block) },
            statusId: "detailStatus",
            step: 3
        },
        payment: {
            do: () => { checkout(block) },
            statusId: "paymentStatus",
            step: 4
        },

    }
    let newState = stateMap[state];
    newState.do();
    changeStatus(newState.statusId);
    if (!newState === 1) {
        document.getElementById("backButton").style.display = "inline-block"
    }
}
function showBeginning(block) {
    document.getElementById("content").style.display = "flex";
    document.getElementById("calendar").style.display = "none";
    document.getElementById("loaderContainer").style.display = "none";
    document.getElementsByClassName("buttonsContainer")[0].style.display = "flex";
    if (!block) {
        history.pushState({ page: "original" }, "", "/")
    }
}


function checkDates(frequencyChoice, block) {
    document.getElementById("content").style.display = "flex";
    document.getElementById('customerForm').style.display = "none";
    document.getElementById("loaderContainer").style.display = "flex";
    document.subOptions = { frequency: frequencyChoice };
    //implement conflict checking
    document.getElementById("calendar").style.display = "flex";
    // let title = document.getElementById('title').cloneNode(true);
    document.getElementsByClassName("buttonsContainer")[0].style.display = "none";


    if (!hoursBusyResolved || !availableHoursResolved) {
        toDo.push(() => { filterByFrequency(frequencyChoice); });
        toDo.push(() => { disableBookedDays((new Date()).getMonth()); });
        toDo.push(() => { hideLoader(); });
    } else {
        filterByFrequency(frequencyChoice);
        disableBookedDays((new Date()).getMonth());
        hideLoader();
    }
    if (!block) {
        history.pushState({ page: "calendar", data: { frequency: frequencyChoice } }, "", "");
    }
}
function goToQuestionForm(block) {
    document.getElementById("squareContainer").style.display = "none";
    document.getElementById("content").style.display = "none";
    document.getElementById('customerForm').style.display = "block";
    if (!block) {
        history.pushState({ page: "form" }, "", "")
    }
}

function checkout() {
    document.getElementById("squareContainer").style.display = "unset";
    document.getElementById("customerForm").style.display = "none";
    history.pushState({ page: "payment" }, "", "")
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

function goBack() {
    window.history.back();
}