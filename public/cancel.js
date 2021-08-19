function showCurrent() {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let months = ["January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"];
    let currDate = new Date(queryParams.get('current'));
    document.getElementById('currApptDate').innerHTML = `${days[currDate.getDay()]} ${currDate.getDate()} ${months[currDate.getMonth()]} ${currDate.getFullYear()}`
    document.getElementById('currApptDate').style.marginLeft = "1vw";
    document.getElementById('currApptTime').innerHTML = formatTime(currDate);
    document.getElementById('currApptTime').style.marginLeft = "1vw";
}
var queryParams = new URLSearchParams(window.location.search);
showCurrent();
function formatTime(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
}
function cancelOne(){
    alert('implement this')
}