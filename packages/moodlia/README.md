# moodlia

Command-line client for the MoodlIA Moodle REST API.

This package contains only the Node CLI and the REST client needed by external users. It does not include the Moodle plugin, server tools, tests, or browser automation.

## Requirements

- Node.js 22 or newer.
- A Moodle site with the MoodlIA local plugin installed.
- A Moodle REST token enabled for the MoodlIA web service.

## Installation

```bash
npm install -g moodlia
```

## Configuration

Set the Moodle URL and REST token in your shell:

```bash
export MOODLE_BASE_URL="https://your-moodle.example"
export MOODLE_REST_TOKEN="your-token"
```

On Windows PowerShell:

```powershell
$env:MOODLE_BASE_URL = "https://your-moodle.example"
$env:MOODLE_REST_TOKEN = "your-token"
```

The CLI also reads a local `.env` file from the current working directory when present:

```text
MOODLE_BASE_URL=https://your-moodle.example
MOODLE_REST_TOKEN=your-token
```

## Usage

```bash
moodlia get-current-user
moodlia get-courses --limit 10
moodlia create-course-category --name "Generated Courses" --visible true
moodlia create-module --course-id 42 --section-number 1 --module-type page --name "Reading" --options "{\"content\":\"<p>Hello</p>\"}"
```

All commands return JSON. Errors are written to stderr as JSON with `error`, `code`, `message`, and `details`.

Show all commands:

```bash
moodlia --help
```

Show command options:

```bash
moodlia create-module --help
```

## Development Sync

This package is generated from the main MoodlIA development repository with:

```bash
npm run npm:sync
```

Do not edit generated files in this package manually. Change the root CLI, REST client, or canonical contract, then sync again.
