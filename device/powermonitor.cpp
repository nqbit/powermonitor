#define LED D7
#define LED_ON 0
#define LED_OFF 1

#define DEBUG_POWERED_ON_DELAY_MSEC 5000
#define DEBUG_POWERED_OFF_DELAY_SEC 60

bool hasCheckedIn = false;

void setup() {
  pinMode(LED, OUTPUT);
  pinMode(WKP, INPUT);
}

void loop() {
  bool isPowered = digitalRead(WKP);

  if(isPowered) {
    if (!hasCheckedIn) {
      Particle.publish("firebase", "on", PRIVATE);
      digitalWrite(LED, LED_ON);
      hasCheckedIn = true;
    } else {
      digitalWrite(LED, LED_OFF);
    }
  } else {
    // not charging
    Particle.publish("firebase", "off", PRIVATE);
    System.sleep(SLEEP_MODE_DEEP, DEBUG_POWERED_OFF_DELAY_SEC);
  }
  delay(DEBUG_POWERED_ON_DELAY_MSEC);
}
