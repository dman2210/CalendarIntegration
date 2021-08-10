const Calendar = require('./calendar');



function displayTime(){
    var calendar = document.getElementById('calendar');
    calendar.className = 'hide';

    var time = document.getElementById('time');
    calendar.className = '';
    Calendar.chooseTime("23", "01:23 AM", time);
}