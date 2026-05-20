import { app, net, protocol } from 'electron';
import { join } from 'path';

function registerSpriteProtocol(): void {
  protocol.handle('app-sprite', (request) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname.replace(/^\//, ''));
    const filePath = join(app.getPath('userData'), 'Data', 'sprites', pathname);
    return net.fetch('file:///' + filePath.replace(/\\/g, '/'));
  });
}

export { registerSpriteProtocol };
