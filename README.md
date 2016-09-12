# PowerMonitor

## Device Overview

The device used in the PowerMonitor is a Particle Electron cellular modem. It is
configured with the VBUS pin tied to the WKP pin. This pin can be monitored on
startup. In the event device power is lost, the device will report power is lost
and enter a deep sleep. The device will wake up every hour and report in. If
power is restored, the WKP pin is asserted high through the voltage divider and
the device is started up, where it will report in that power is on.