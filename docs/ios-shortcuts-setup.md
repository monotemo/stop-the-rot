# iOS Shortcuts Setup for Stop The Rot

To enable Screen Time integration, you need to create two iOS Shortcuts on your kid's iPad.

## Prerequisites

1. Your Stop The Rot server must be accessible from the iPad (use ngrok for testing)
2. You'll need your server URL (e.g., `https://your-server.ngrok.io`)

## Shortcut 1: Unrot-Enable

This shortcut is triggered when your kid purchases screen time.

1. Open the Shortcuts app on the iPad
2. Tap the `+` to create a new shortcut
3. Tap "Add Action" and search for "URL"
4. Add a "Get Contents of URL" action with:
   - URL: `YOUR_SERVER_URL/api/screen-time/enable?kid_id=1&minutes=15`
   - Method: `POST`
5. Add a "Set Screen Time Limit" action:
   - Tap "Apps" to select which apps to limit
   - Set duration to 15 minutes (or match the URL parameter)
6. Add a "Wait" action:
   - Set to 15 minutes
7. Add a "Run Shortcut" action:
   - Select "Unrot-Disable" (create this first, or come back and add this)
8. Name the shortcut: "Unrot-Enable"

## Shortcut 2: Unrot-Disable

This shortcut is called when the timer expires (or manually).

1. Create a new shortcut
2. Add "Get Contents of URL" action:
   - URL: `YOUR_SERVER_URL/api/screen-time/disable?kid_id=1`
   - Method: `POST`
3. Add a "Clear Screen Time Limit" action:
   - Select the same apps you limited in Unrot-Enable
4. Name the shortcut: "Unrot-Disable"

## How It Works

1. Kid purchases screen time in the app
2. App calls `/api/screen-time/purchase` which creates a session in the database
3. You (parent) manually trigger "Unrot-Enable" shortcut on the iPad
4. Shortcut checks session validity and enables Screen Time for the purchased duration
5. After the wait period, "Unrot-Disable" runs and re-enables limits

## Automation (Optional)

You can set up automation to run "Unrot-Enable" when a notification is received, but the simplest approach is manual trigger for now.

## Troubleshooting

- **"No active session found"**: Make sure screen time was purchased before running the shortcut
- **Server not reachable**: Check your server URL is accessible from the iPad (try in Safari first)
- **Screen Time limits not working**: Make sure you're selecting the correct apps in the "Set Screen Time Limit" action
