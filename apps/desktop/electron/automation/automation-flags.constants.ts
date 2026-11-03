/* @layer electron-main @kind constants */
const ROTP_AUTOMATION_FLAGS = ['--auto-state', '--auto-start', '--auto-flood', '--dump-layers', '--dump-nav', '--sim-run', '--start-page', '--screenshot-frames', '--input-script', '--ap-connect', '--lobby-join', '--event-log', '--profile-name'];

const GAME_LAUNCH_FLAGS = ['--auto-state', '--auto-start'];

const FORWARDED_VALUE_FLAGS = ['ap-connect', 'lobby-join', 'event-log', 'profile-name'];

const SCREENSHOT_FLAG = '--screenshot';

export { FORWARDED_VALUE_FLAGS, GAME_LAUNCH_FLAGS, ROTP_AUTOMATION_FLAGS, SCREENSHOT_FLAG };
