#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 
#define SCREEN_HEIGHT 32
#define OLED_RESET     -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(9600);
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  display.display();
  delay(2000); // Pause for 2 seconds
  display.clearDisplay();
}

void loop() {
  if (Serial.available() > 0) {
    String message = Serial.readStringUntil('\n');
    String content = extractData(message, "!!", "!!");
    String params = extractData(message, "..", "..");

    int xCursor = getValue(params, ',', 0).toInt();
    int yCursor = getValue(params, ',', 1).toInt();
    int textSize = getValue(params, ',', 2).toInt();

    display.clearDisplay();
    display.setTextSize(textSize);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(xCursor, yCursor);
    display.println(content);
    display.display();
  }
}

String extractData(String data, String startDelimiter, String endDelimiter) {
  int startIndex = data.indexOf(startDelimiter) + startDelimiter.length();
  int endIndex = data.indexOf(endDelimiter, startIndex);
  return data.substring(startIndex, endIndex);
}

String getValue(String data, char separator, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
