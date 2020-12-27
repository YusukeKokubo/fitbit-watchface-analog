import clock from "clock";
import document from "document";
import * as simpleHRM from "./simple/hrm";
import { battery } from "power";
import * as util from "./simple/utils";
import { days} from "./simple/locales/en.js";
import * as simpleActivity from "./simple/activity";

// Tick every second
clock.granularity = "seconds";

let hourHand = document.getElementById("hours") as GroupElement;
let minHand = document.getElementById("mins") as GroupElement;
let secHand = document.getElementById("secs") as GroupElement;

let iconHRM = document.getElementById("iconHRM");
let imgHRM = iconHRM.getElementById("icon") as ImageElement;
let txtHRM = document.getElementById("txtHRM") as GraphicsElement;

let textBattery = document.getElementById("txtBattery") as GraphicsElement
let textDate = document.getElementById("txtDate") as GraphicsElement
let textSteps = document.getElementById("txtSteps") as GraphicsElement

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours: number, minutes: number) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes: number) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds: number) {
  return (360 / 60) * seconds;
}

// Rotate the hands every tick
function updateClock() {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);

  let dayName = days[today.getDay()];
  let dayNumber = util.zeroPad(today.getDate());
  textDate.text = `${dayName} ${dayNumber}`
}

// Update the clock every tick event
clock.addEventListener("tick", updateClock);


// copied from https://community.fitbit.com/t5/SDK-Development/Find-resulting-x-and-y-of-rotated-text/td-p/2780005#
let names = ['6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5'];

// Angle to place each of the above textboxes.  6 o'clock is at 0-degrees, the rest are at 30-degree increments
let tmpAngle = 0;

for (let i=1; i <= 12; i++) {
  // get the testbox
  let c = document.getElementById(`test-text${i}`) as GraphicsElement;

  // 110 is the distance from the center (150,150) that the text will be placed on
  // the smaller the number, the closed the textboxes will be to the center dot.
  let a = rotatePoint({x: 174, y: 174}, {x: 0, y: 130}, tmpAngle);

   // slight adjustment to make sure things are centered...
  c.x = a.x - 7;
  c.y = a.y + 7;
  
  // get the text to show
  c.text = names[i-1];

  console.log(`test-text${i}, ${tmpAngle}, ${names[i-1]}`);

  tmpAngle += 30;  
}

// ----------------------------------------
type XY = {x: number, y: number}
function rotatePoint(origin: XY, offsets: XY, angle: number) {
  let radians = angle * Math.PI / 180.0;
  let cos = Math.cos(radians);
  let sin = Math.sin(radians);
  let dX = offsets.x;
  let dY = offsets.y;

  return {
    x: Math.round( (cos * dX) - (sin * dY) + origin.x),
    y: Math.round( (sin * dX) + (cos * dY) + origin.y)
  };
}

function hrmCallback(data) {
  txtHRM.text = `${data.bpm}`;
  if (data.zone === "out-of-range") {
    imgHRM.href = "images/heart_open.png";
  } else {
    imgHRM.href = "images/heart_open.png";
  }
  if (data.bpm !== "--") {
    iconHRM.animate("highlight");
  }
}
simpleHRM.initialize(hrmCallback);

battery.addEventListener('change', (event) => {
  textBattery.text = `${battery.chargeLevel}`
})

// Activity
function activityCallback(data) {
  textSteps.text = `${data.steps.pretty}`
}
simpleActivity.initialize("seconds", activityCallback);
