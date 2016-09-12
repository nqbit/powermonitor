#define LED D7
#define LED_ON 1
#define LED_OFF 0

#define POWERED_CHECK_IN      720
#define POWERED_ON_DELAY_MSEC 5000
#define POWERED_OFF_DELAY_SEC 60*60

bool hasCheckedIn = false;
int counter = 0;

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
      delay(100);
      digitalWrite(LED, LED_OFF);
      delay(100);
      digitalWrite(LED, LED_ON);
      delay(100);
      digitalWrite(LED, LED_OFF);
      hasCheckedIn = true;
    } else {
      digitalWrite(LED, LED_ON);
      delay(100);
      digitalWrite(LED, LED_OFF);
      counter++;
      if (counter == POWERED_CHECK_IN) {
        hasCheckedIn = false;
        counter = 0;
      }
    }
  } else {
    hasCheckedIn = false;
    digitalWrite(LED, LED_OFF);
    // not charging
    Particle.publish("firebase", "off", PRIVATE);
    System.sleep(SLEEP_MODE_DEEP, POWERED_OFF_DELAY_SEC);
  }
  delay(POWERED_ON_DELAY_MSEC);
}
