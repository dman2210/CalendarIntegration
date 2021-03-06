var changeCardURL = 'https://calendar-integration-backend.vercel.app/api/changeCard';
// var changeCardURL = "http://localhost:3000/api/changeCard";
const appId = "sq0idp-nx_L1O_rlzb112jFLGX8XQ";
const locationId = "PK14BK78YYVYK";
var queryParams = new URLSearchParams(window.location.search);

async function initializeCard(payments) {
    console.log("initializing")
    const card = await payments.card();
    console.log("card", card);
    console.log(await card.attach("#card-container"));
    console.log("thing attached");
    return card;
}

async function finishTransaction(token) {
    console.log("running transaction...");
    let data = {
        token: token
    }
    let reqs = ["customerID", "token", "email", "who"];
    reqs.forEach((item) => { if (!data[item]) { data[item] = queryParams.get(item) } });
    // console.log(data)
    const changeCardResponse = await fetch(changeCardURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    // console.log(changeCardResponse);
    if (changeCardResponse.ok) {
        return true;
    } else {
        console.log(
            "error! response: " +
            JSON.stringify(changeCardResponse)
        );
        return (
            "error! response: " +
            JSON.stringify(changeCardResponse)
        );
    }
}

async function tokenize(paymentMethod) {
    const tokenResult = await paymentMethod.tokenize();
    // console.log(tokenResult);
    if (tokenResult.status === "OK") {
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
    // const statusContainer = document.getElementById("payment-status-container");
    // if (status === "SUCCESS") {
    //     statusContainer.classList.remove("is-failure");
    //     statusContainer.classList.add("is-success");
    // } else {
    //     statusContainer.classList.remove("is-success");
    //     statusContainer.classList.add("is-failure");
    // }

    // statusContainer.style.visibility = "visible";
}

document.addEventListener("DOMContentLoaded", runSquare());

async function runSquare() {
    if (!window.Square) {
        throw new Error("Square.js failed to load properly");
    }

    let payments;
    try {
        payments = window.Square.payments(appId, locationId);
    } catch (error) {
        // const statusContainer = document.getElementById(
        //     "payment-status-container"
        // );
        // statusContainer.className = "missing-credentials";
        // statusContainer.style.visibility = "visible";
        // return;
        console.log(error)
    }
    let card;
    try {
        card = await initializeCard(payments);
        document.getElementById('loaderContainer').style.display = 'none';
    } catch (e) {
        console.error("Initializing Card failed", e);
        return;
    }

    // Checkpoint 2.
    async function handlePaymentMethodSubmission(event, paymentMethod) {
        event.preventDefault();

        try {
            let main = document.getElementById("mainContainer");
            // disable the submit button as we await tokenization and make a payment request.
            cardButton.disabled = true;
            const token = await tokenize(paymentMethod);
            console.log("sending request...");
            main.innerHTML = "Changing card on file...";
            const paymentResults = await finishTransaction(token);
            if (paymentResults === true) {
                console.log("request success");
                displayPaymentResults("SUCCESS");
                main.innerHTML = `<h1>Card succesfully changed! Email confirmation has been sent.</h1>`;
            } else {
                console.log("request error");
                displayPaymentResults("ERROR");

                main.innerHTML = `<h1>There was an error</h1>`;
            }
        } catch (e) {
            cardButton.disabled = false;
            displayPaymentResults("FAILURE");
            console.error(e.message);
        }
    }

    const cardButton = document.getElementById("card-button");
    cardButton.classList.add('buttonAdapt');
    cardButton.addEventListener("click", async function (event) {
        await handlePaymentMethodSubmission(event, card);
    });
}