// Include necessary libraries for OLED display and graphics
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// Define OLED display settings
#define SCREEN_WIDTH 128 // OLED display width in pixels
#define SCREEN_HEIGHT 32 // OLED display height in pixels
#define OLED_RESET     -1 // OLED reset pin (not used here, hence -1)

// Initialize Adafruit_SSD1306 display object with defined settings
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

void setup() {
  Serial.begin(9600); // Initialize serial communication at 9600 bits per second
  // Attempt to start the OLED display, hang and print error message if fail
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Infinite loop on failure to indicate error
  }
  display.display(); // Show initial display buffer (splash screen or blank)
  delay(2000); // Wait for 2 seconds
  display.clearDisplay(); // Clear the display buffer
}

void loop() {
  // Check if serial input is available
  if (Serial.available() > 0) {
    // Read the incoming serial data until newline character
    String message = Serial.readStringUntil('\n');
    // Extract content and parameters from the message using custom delimiters
    String content = extractData(message, "£^", "£^");
    String params = extractData(message, "ù$", "ù$");

    // Parse parameters for cursor position and text size
    int xCursor = getValue(params, ',', 0).toInt();
    int yCursor = getValue(params, ',', 1).toInt();
    int textSize = getValue(params, ',', 2).toInt();

    // Prepare display with the parsed settings and show the content
    display.clearDisplay();
    display.setTextSize(textSize); // Set text size
    display.setTextColor(SSD1306_WHITE); // Set text color to white
    display.setCursor(xCursor, yCursor); // Set cursor position
    display.println(content); // Print the content
    display.display(); // Update the display with new content
  }
}

// Function to extract a substring between given start and end delimiters
String extractData(String data, String startDelimiter, String endDelimiter) {
  int startIndex = data.indexOf(startDelimiter) + startDelimiter.length();
  int endIndex = data.indexOf(endDelimiter, startIndex);
  return data.substring(startIndex, endIndex);
}

// Function to get a value from a comma-separated string by index
String getValue(String data, char separator, int index) {
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length() - 1;

  // Iterate over data to find the nth occurrence of separator
  for (int i = 0; i <= maxIndex && found <= index; i++) {
    if (data.charAt(i) == separator || i == maxIndex) {
      found++;
      strIndex[0] = strIndex[1] + 1;
      strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }
  // Return the substring found at the nth position
  return found > index ? data.substring(strIndex[0], strIndex[1]) : "";
}
