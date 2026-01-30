<div align="center">
  <img src="extension/public/icon/96.png" alt="Who's on meet? Icon" width="64" height="64">
  <h1>Who's on meet?</h1>
  <p style="text-wrap: balance;">A Chrome extension that helps you track attendance in Google Meet <br/> by comparing registered user names with the current participants list.</p>
</div>

## Installation

### Option 1: Install from ZIP file

1. Download the `whosonmeet.zip` file from [release page](https://github.com/iamchiwon-v6x/whosonmeet/releases)
2. Extract the zip file to a folder on your computer
3. Open Google Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" (toggle in the top right corner)
5. Click "Load unpacked"
6. Select the extracted folder
7. The extension is now installed and ready to use

### Option 2: Build from source

1. Clone or download the source code
2. Navigate to the extension directory:
   ```bash
   cd extension
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Build the extension:
   ```bash
   pnpm build
   ```
5. Open Google Chrome and navigate to `chrome://extensions/`
6. Enable "Developer mode" (toggle in the top right corner)
7. Click "Load unpacked"
8. Select the `.output/chrome-mv3` folder (or copy it to another location first if needed)
9. The extension is now installed and ready to use

## How to Use

### Step 1: Register User Names

1. Click the extension icon in your Chrome toolbar
2. Enter user names in the input field and click "Add" (or press Enter)
3. Registered users will appear in the list below

### Step 2: Check Attendance

1. **Important**: Make sure you're on a Google Meet page where the participant list is visible
2. Click the "Check" button in the extension popup
3. The extension will scan the current participants and compare them with your registered users
4. Users who match will be marked with:
   - A green "출석" (Attendance) badge
   - Their profile thumbnail image (if available)

### Name Matching Rules

The extension uses flexible name matching:

- **Case-insensitive**: "John Doe" matches "john doe" and "JOHN DOE"
- **Spaces ignored**: "John Doe" matches "JohnDoe"
- **Punctuation ignored**: "John.Doe" matches "John Doe"
- **Parentheses content ignored**: "John (Manager)" matches "John"

## Notes

- The extension only works when the Google Meet participant list is visible on the page
- Make sure to check attendance while the meeting is active and participants are shown
- User names are saved locally and will persist between browser sessions
- Participant lists are stored in local storage
