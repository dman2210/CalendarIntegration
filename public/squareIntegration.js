// var subURL = 'https://calendar-integration-backend.vercel.app/api/subscribe';
var subURL = "http://localhost:3000/api/subscribe";
const appId = 'sandbox-sq0idb-k47NFyfiTnNf1wkfFcHAvg';
const locationId = 'LXSNHMQ7X5J6G';

async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach('#card-container');
    console.log("thing attached");
    return card;
}

async function finishTransaction(token) {
    console.log('running transaction...');
    let body = JSON.stringify({ customerDetails: document.customerDetails, token: token, subOptions: document.subOptions, });
    console.log(body);
    const subscriptionResponse = await fetch(subURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });
    console.log(subscriptionResponse);
    if (subscriptionResponse.ok) {
        return true;
    } else {
        console.log("error! subscription response: " + JSON.stringify(subscriptionResponse));
        return "error! subscription response: " + JSON.stringify(subscriptionResponse);
    }


}

async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    console.log(tokenResult);
    if (tokenResult.status === 'OK') {
        return tokenResult.token;
    } else {
        let errorMessage = `Tokenization failed with status: ${tokenResult.status}`;
        if (tokenResult.errors) {
            errorMessage += ` and errors: ${JSON.stringify(
                tokenResult.errors
            )}`;
        }

        throw new Error(errorMessage);
    }
}

// status is either SUCCESS or FAILURE;
function displayPaymentResults(status) {
    const statusContainer = document.getElementById(
        'payment-status-container'
    );
    if (status === 'SUCCESS') {
        statusContainer.classList.remove('is-failure');
        statusContainer.classList.add('is-success');
    } else {
        statusContainer.classList.remove('is-success');
        statusContainer.classList.add('is-failure');
    }

    statusContainer.style.visibility = 'visible';
}

document.addEventListener('DOMContentLoaded', runSquare());

async function runSquare() {
    if (!window.Square) {
        throw new Error('Square.js failed to load properly');
    }

    let payments;
    try {
        payments = window.Square.payments(appId, locationId);
    } catch {
        const statusContainer = document.getElementById(
            'payment-status-container'
        );
        statusContainer.className = 'missing-credentials';
        statusContainer.style.visibility = 'visible';
        return;
    }

    let card;
    try {
        card = await initializeCard(payments);
    } catch (e) {
        console.error('Initializing Card failed', e);
        return;
    }

    // Checkpoint 2.
    async function handlePaymentMethodSubmission(event, paymentMethod) {
        event.preventDefault();

        try {
            let main = document.getElementById("main");
            // disable the submit button as we await tokenization and make a payment request.
            cardButton.disabled = true;
            const token = await tokenize(paymentMethod);
            console.log("sending request...");
            main.innerHTML = "Setting up cleaning...;"
            const paymentResults = await finishTransaction(token);
            if (paymentResults === true) {
                console.log("request success");
                displayPaymentResults('SUCCESS');
                main.innerHTML = `<h1>Payment success!! Receipt has been emailed with scheduling info.</h1>`;
            } else {
                console.log("request error");
                displayPaymentResults('ERROR');

                main.innerHTML = `<h1>There was an error</h1>`;
            }

        } catch (e) {
            cardButton.disabled = false;
            displayPaymentResults('FAILURE');
            console.error(e.message);
        }
    }

    const cardButton = document.getElementById('card-button');
    cardButton.addEventListener('click', async function (event) {
        await handlePaymentMethodSubmission(event, card);
    });
};

//this is a big nasty one. refactor if you can. email me at dman2210@gmail.com
function filterByFrequency(frequency) {
    //wait for busy times to come back
    while (hoursBusyResolved === undefined || hoursBusyResolved === false) {

    }
    //check for just one appt

    if (frequency === "one") {
        consol.log("only one")
        hoursAvailable = filterForOne();
        hideLoader();
        return;
    }
    //else
    let frequencyMap = {
        daily: 1,
        monthly: 28,
        weekly: 7,
        biweekly: 14,

    }
    //set up step and date variables
    let step = frequencyMap[frequency];
    let stepDay = new Date();
    stepDay.setDate(stepDay.getDate() + 1);
    stepDay.setHours(0);
    stepDay.setMinutes(0);
    stepDay.setSeconds(0);
    stepDay.setMilliseconds(1);
    let originalDate = new Date(stepDay.getTime());
    //prepare the holder for the times still available.
    let currentlyAvailable = [];
    for (let i = 0; i < 48; i++) {
        currentlyAvailable.push(new Date(stepDay.getTime()))
        stepDay.setMinutes(stepDay.getMinutes() + 30);
    }
    //prepare for step checking

    hoursAvailable = [];
    for (let i = 0; i < 12; i++) {
        hoursAvailable.push([])
    }
    let eoyear = false;
    stepDay.setTime(originalDate.getTime());
    //goes through the necessary amount of days so all days are hit
    for (let i = 0; i < step; i++) {
        //iterate by step till end of year
        
        eoyear = false;
        while (eoyear === false) {
            let busyDay = hoursBusy[stepDay.getMonth()][stepDay.getDate()];
            //iterate over busy times
            for (let j = 0; j < busyDay.length; j++) {
                let busyBlock = busyDay[j];
                //check each remaining time
                for (let k = 0; k < currentlyAvailable.length; k++) {
                    let activeDay = currentlyAvailable[k];
                    let end = new Date(activeDay.getTime());
                    end.setHours(end.getHours() + 2);
                    if (busyBlock.start.getDate() === activeDay.getDate()) {
                        //check for conflict in start and end times
                        //if start earlier than busyStart or later than busyEnd... same for end
                        if (!((activeDay < busyBlock.start || activeDay > busyBlock.end) && (end < busyBlock.start || end > busyBlock.end))) {
                            let lastIndex;
                            for (let l = k; l < currentlyAvailable.length; l++) {
                                //check for the next good appt
                                lastIndex = l;
                                if ((activeDay < busyBlock.start || activeDay > busyBlock.end) && (end < busyBlock.start || end > busyBlock.end)) {
                                    lastIndex = lastIndex - 1
                                    break;
                                }
                            }
                            //remove up to next available appt
                            currentlyAvailable.splice(k, (lastIndex - k));
                        }
                    }
                }
            }
            //iterate to next step
            stepDay.setDate(stepDay.getDate() + step);
            if ((stepDay.getMonth() === originalDate.getMonth() && stepDay.getFullYear() !== originalDate.getFullYear())) {
                eoyear = true;
            }
        }

        //iterate to next day
        stepDay.setTime(originalDate.getTime());
        stepDay.setDate(stepDay.getDate() + i + 1);
        let formatted = currentlyAvailable.map(timeDate => formatTime(timeDate));
        //go back through days and set the hours
        let activeDay = new Date(stepDay.getTime());
        activeDay.setDate(activeDay.getDate() - 1)
        eoyear = false;
        while (eoyear === false) {
            hoursAvailable[activeDay.getMonth()][activeDay.getDate()] = formatted;
            activeDay.setDate(activeDay.getDate() + step);
            if ((activeDay.getMonth() === originalDate.getMonth() && activeDay.getFullYear() !== originalDate.getFullYear())) {
                eoyear = true;
            }
        }
        // hoursAvailable[stepDay.getMonth()][stepDay.getDate() - 1].push(formatted);
    }
    hideLoader()
    return;
}

function hideLoader() {
    document.getElementById("loaderContainer").style.display = "none";

}

function filterForOne() {
    //initialize array
    if (availability === undefined || !availability) {
        let availability = [];
        for (let i = 0; i < 12; i++) {
            availability[i] = [];
        }
    }
    let newDate = new Date();
    newDate.setMinutes((Math.round(newDate.getMinutes() / 30) * 30) + 30)
    let end = new Date(newDate.getTime());
    end.setHours(end.getHours() + 2);
    let originalDate = new Date(newDAte.getTime());
    //while not eoyear
    while (!(newDate.getMonth() === originalDate.getMonth && newDate.getFullYear() !== originalDate.getFullYear())) {
        let conflict = false;
        let busyDay = busyHours[newDate.getMonth()][newDate.getDate()];
        let conflictIndex;
        //check all busy times for conflict
        busyDay.forEach(
            (busyBlock, index) => {
                if (!conflict && busyBlock.start.getDate() === newDate.getDate()) {
                    //check for conflict in start and end times
                    //if start earlier than busyStart or later than busyEnd... same for end
                    if (!((newDate < busyBlock.start || newDate > busyBlock.end) && (end < busyBlock.start || end > busyBlock.end))) {
                        conflictIndex = index;
                        conflict = true;
                    }
                }
            }
        )
        if (!conflict) {
            availability[newDate.getMonth()][newDate.getDate()].push(formatTime(newDate));
            newDate.setMinutes(newDate.getMinutes() + 30);
            //
        } else {
            newDate.setTime(busyDay[index].getTime())
        }
    }
    return availability;
}

function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
};