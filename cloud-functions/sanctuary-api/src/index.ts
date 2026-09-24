/* @layer root-config @kind logic */
/** The Sanctuary API: one Gen2 HTTP function behind the site's /api rewrite.
 *  Everything past this line is the router and one file per route. */
import { http } from '@google-cloud/functions-framework';
import { createRouter } from './router';
import { ROUTES } from './route-table';

http('sanctuaryApi', createRouter(ROUTES));
