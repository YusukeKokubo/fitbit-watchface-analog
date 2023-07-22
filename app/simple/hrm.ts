/*
  Returns the Heart Rate BPM, with off-wrist detection.
  Callback raised to update your UI.
*/
import { me } from "appbit"
import { display } from "display"
import { HeartRateSensor } from "heart-rate"
import { user } from "user-profile"

let hrm: HeartRateSensor
let hrmCallback: (data: {
  bpm: string
  zone: string
  restingHeartRate: string
}) => void
let lastReading = 0
let heartRate: string

export function initialize(callback) {
  if (
    HeartRateSensor &&
    me.permissions.granted("access_heart_rate") &&
    me.permissions.granted("access_user_profile")
  ) {
    hrmCallback = callback
    hrm = new HeartRateSensor()
    setupEvents()
    start()
    lastReading = hrm.timestamp
  } else {
    console.log("Denied Heart Rate or User Profile permissions")
    callback({
      bpm: "denied permissions",
      zone: "denied",
      restingHeartRate: "???",
    })
  }
}

function getReading() {
  if (hrm.timestamp === lastReading) {
    heartRate = "--"
  } else {
    heartRate = String(hrm.heartRate)
  }
  lastReading = hrm.timestamp
  hrmCallback({
    bpm: heartRate,
    zone: user.heartRateZone(hrm.heartRate || 0),
    restingHeartRate: String(user.restingHeartRate || 0),
  })
}

function setupEvents() {
  hrm.onreading = () => {
    getReading()
  }
  display.addEventListener("change", function () {
    if (display.on) {
      start()
    } else {
      stop()
    }
  })
}

export function start() {
  hrm.start()
  getReading()
}

export function stop() {
  hrm.stop()
}
