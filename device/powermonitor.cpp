#define LED D7
#define LED_ON 0
#define LED_OFF 1

PMIC pmic;
bool hasCheckedIn = false;

void setup() {
    pmic.begin();
    pinMode(LED, OUTPUT);
}

void loop() {
  uint8_t status = pmic.getSystemStatus();
  // bool isCharging = ((status >> 4) && 0x03) == 0x00; // this may be wrong
  bool isNotVbusPowered = ((status >> 6) && 0x03) == 0x00;

  if(isNotVbusPowered) {
    // not charging
    Particle.publish("firebase", "off", PRIVATE);
    System.sleep(SLEEP_MODE_DEEP, 60); // Should reset
  } else {
    if (!hasCheckedIn) {
        Particle.publish("firebase", "on", PRIVATE);
        digitalWrite(LED, LED_ON);
        hasCheckedIn = true;
    } else {
        digitalWrite(LED, LED_OFF);
    }
  }
  delay(5000);
}
