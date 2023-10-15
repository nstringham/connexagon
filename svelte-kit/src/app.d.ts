// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}

	namespace CSS {
		declare const paintWorklet: undefined | { addModule(url: string): void };
	}
}

export {};
