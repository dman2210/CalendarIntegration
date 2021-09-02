var queryParams = new URLSearchParams(window.location.search);
function promptCancelAll() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('prompt').style.display = 'flex';
    document.getElementById('loaderContainer').style.display = 'flex';
}

function closePrompt() {
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('prompt').style.display = 'none';
    document.getElementById('loaderContainer').style.display = 'none';
}

async function cancelAll() {
    document.getElementById('loader').style.display = 'flex';
    document.getElementById('prompt').style.display = 'none';
    let url = "https://calendar-integration-backend.vercel.app/api/appointments?action=cancel";
    // let url = "http://localhost:3000/api/appointments?action=cancel";
    let customerID = queryParams.get('customerID');
    let eventID = "all"
    let body = { customerID: customerID, id: eventID };
    ["where", "when", "who", "email", "eventID", "current", "customerID"].forEach((item) => {
        body[item] = queryParams.get(item);
    })
    console.log(body)
    let respo = await fetch(url, { method: "POST", body: JSON.stringify(body) });
    if (respo.ok) {
        console.log(respo);
        document.getElementById('confirm').innerHTML = '<h2>Your subscription has been cancelled. You may recieve one last invoice. If so, please ignore it.</h2>'
    } else {
        console.log(respo);
        document.getElementById('confirm').innerHTML = '<h2>There was an error.</h2>'
    }
    document.getElementById('loaderContainer').style.display = 'none';

}