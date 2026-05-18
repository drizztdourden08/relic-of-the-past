import { app, net, protocol } from 'electron';
import { join } from 'path';

export function registerSpriteProtocol(): void {
  protocol.handle('app-sprite', (request) => {
    const url = new URL(request.url);
    const filePath = join(app.getPath('userData'), 'Data', 'sprites', url.pathname.replace(/^\//, ''));
    return net.fetch('file:///' + filePath.replace(/\\/g, '/'));
  });
}
