import { browser } from '$app/environment';

if (browser) {
	throw new Error('server is a node only module');
}
