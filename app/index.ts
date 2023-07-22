import clock from "clock"
import { battery } from "power"
import document from "document"
import * as simpleHRM from "./simple/hrm"
import * as util from "./simple/utils"
import { days } from "./simple/locales/en.js"
import * as simpleActivity from "./simple/activity"
import { FitFont } from "fitfont"
import { display } from "display"
import { me } from "appbit"

// Tick every second
clock.granularity = "seconds"

let hourHand = document.getElementById("hours") as GroupElement
let minHand = document.getElementById("mins") as GroupElement
let secHand = document.getElementById("secs") as GroupElement

let outercenterdot = document.getElementById("outercenterdot") as GroupElement
let innercenterdot = document.getElementById("innercenterdot") as GroupElement

let iconHRM = document.getElementById("iconHRM")
let imgHRM = iconHRM.getElementById("icon") as ImageElement
let txtHRM = document.getElementById("txtHRM") as GraphicsElement

let textBattery = document.getElementById("txtBattery") as GraphicsElement
let textDate = document.getElementById("txtDate") as GraphicsElement
let textSteps = document.getElementById("txtSteps") as GraphicsElement

let textBatteryPercenet = document.getElementById(
  "txtBatteryPercent"
) as GraphicsElement
let textStepsText = document.getElementById("txtStepsText") as GraphicsElement

let imgLogo = document.getElementById("logo") as ImageElement

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours: number, minutes: number) {
  let hourAngle = (360 / 12) * hours
  let minAngle = (360 / 12 / 60) * minutes
  return hourAngle + minAngle
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes: number) {
  return (360 / 60) * minutes
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds: number) {
  return (360 / 60) * seconds
}

// Rotate the hands every tick
function updateClock() {
  let today = new Date()
  let hours = today.getHours() % 12
  let mins = today.getMinutes()
  let secs = today.getSeconds()

  let hoursAngle = hoursToAngle(hours, mins)
  let minAngle = minutesToAngle(mins)
  let secAngle = secondsToAngle(secs)
  hourHand.groupTransform.rotate.angle = hoursAngle
  minHand.groupTransform.rotate.angle = minAngle
  secHand.groupTransform.rotate.angle = secAngle

  let dayName = days[today.getDay()]
  let dayNumber = util.zeroPad(today.getDate())
  textDate.text = `${dayName} ${dayNumber}`

  // imgLogo.animate("highlight");
  // imgLogo.x = 300 - secs * 6;
  // imgLogo.x = 255
  // imgLogo.y = 260
}

// Update the clock every tick event
clock.addEventListener("tick", updateClock)

// *********************
// copied from https://community.fitbit.com/t5/SDK-Development/Find-resulting-x-and-y-of-rotated-text/td-p/2780005#
// *********************
let names = ["6", "7", "8", "9", "10", "11", "12", "1", "2", "3", "4", "5"]

// Angle to place each of the above textboxes.  6 o'clock is at 0-degrees, the rest are at 30-degree increments
let tmpAngle = 0

for (let i = 1; i <= 12; i++) {
  // get the testbox
  let c = document.getElementById(`test-text${i}`) as GraphicsElement

  // 110 is the distance from the center (150,150) that the text will be placed on
  // the smaller the number, the closed the textboxes will be to the center dot.
  let a = rotatePoint({ x: 168, y: 168 }, { x: 0, y: 127 }, tmpAngle)

  // slight adjustment to make sure things are centered...
  c.x = a.x - 0
  c.y = a.y + 13

  // get the text to show
  let d = new FitFont({
    id: c,
    font: "Jost_40",
    halign: "middle",
    valign: "baseline",
    letterspacing: -0,
  })
  d.text = names[i - 1]

  // console.log(`test-text${i}, ${tmpAngle}, ${names[i - 1]}`);

  tmpAngle += 30
}

type XY = { x: number; y: number }
function rotatePoint(origin: XY, offsets: XY, angle: number) {
  let radians = (angle * Math.PI) / 180.0
  let cos = Math.cos(radians)
  let sin = Math.sin(radians)
  let dX = offsets.x
  let dY = offsets.y

  return {
    x: Math.round(cos * dX - sin * dY + origin.x),
    y: Math.round(sin * dX + cos * dY + origin.y),
  }
}
// *********************

function hrmCallback(data) {
  txtHRM.text = `${data.bpm}`
  if (data.zone === "out-of-range") {
    imgHRM.href = "images/heart_open.png"
  } else {
    imgHRM.href = "images/heart_open.png"
  }
  if (data.bpm !== "--") {
    iconHRM.animate("highlight")
  }
}
simpleHRM.initialize(hrmCallback)

battery.addEventListener("change", (event) => {
  textBattery.text = `${battery.chargeLevel}`
})

// Activity
function activityCallback(data) {
  textSteps.text = `${data.steps.pretty}`
}
simpleActivity.initialize("seconds", activityCallback)

if (display.aodAvailable && me.permissions.granted("access_aod")) {
  display.aodAllowed = true

  display.addEventListener("change", () => {
    console.log("aod active: ", display.aodActive)
    if (!display.aodActive && display.on) {
      simpleHRM.start()
      clock.granularity = "seconds"
      outercenterdot.style.display = "inline"
      innercenterdot.style.display = "inline"
      imgLogo.style.display = "inline"
      secHand.style.display = "inline"
      imgHRM.style.display = "inline"
      txtHRM.style.display = "inline"
      textSteps.style.display = "inline"
      textBattery.style.display = "inline"
      textBatteryPercenet.style.display = "inline"
      textStepsText.style.display = "inline"
    } else {
      simpleHRM.stop()
      clock.granularity = "minutes"
      outercenterdot.style.display = "none"
      innercenterdot.style.display = "none"
      imgLogo.style.display = "none"
      secHand.style.display = "none"
      imgHRM.style.display = "none"
      txtHRM.style.display = "none"
      textSteps.style.display = "none"
      textBattery.style.display = "none"
      textBatteryPercenet.style.display = "none"
      textStepsText.style.display = "none"
    }
  })
}
