/* @layer electron-main @kind logic */
import { ipcMain } from 'electron';
import { readFile, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { getUserDataPath } from '../lib/paths';
import type { PlaySession } from '../../../../shared/types/session';

const registerSessionHandlers = (): void => {
  ipcMain.handle('sessions:list', async (_event, profileId: string) => {
    try {
      const data = await readFile(getUserDataPath('profiles', profileId, 'sessions.json'), 'utf-8');
      const sessions: PlaySession[] = JSON.parse(data);
      return sessions.sort((a, b) => b.startedAt - a.startedAt);
    } catch {
      return [];
    }
  });

  ipcMain.handle('sessions:save', async (_event, profileId: string, session: PlaySession) => {
    const profileDir = getUserDataPath('profiles', profileId);
    await mkdir(profileDir, { recursive: true });
    const filePath = join(profileDir, 'sessions.json');
    let sessions: PlaySession[] = [];
    try {
      const data = await readFile(filePath, 'utf-8');
      sessions = JSON.parse(data);
    } catch { /* new file */ }
    sessions.push(session);
    if (sessions.length > 100) sessions = sessions.slice(-100);
    await writeFile(filePath, JSON.stringify(sessions, null, 2), 'utf-8');
  });

  // Tracker state
  ipcMain.handle('tracker:save', async (_event, profileId: string, state: unknown) => {
    const profileDir = getUserDataPath('profiles', profileId);
    await mkdir(profileDir, { recursive: true });
    await writeFile(join(profileDir, 'tracker.json'), JSON.stringify(state, null, 2), 'utf-8');
  });

  ipcMain.handle('tracker:load', async (_event, profileId: string) => {
    try {
      const data = await readFile(getUserDataPath('profiles', profileId, 'tracker.json'), 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  });
};

export { registerSessionHandlers };
