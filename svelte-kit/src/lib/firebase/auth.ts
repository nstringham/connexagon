export async function signInGoogle() {
	const { auth, signInWithPopup, GoogleAuthProvider } = await import('./client');
	const provider = new GoogleAuthProvider();
	return await signInWithPopup(auth, provider);
}

export async function signInTwitter() {
	const { auth, signInWithPopup, TwitterAuthProvider } = await import('./client');
	const provider = new TwitterAuthProvider();
	return await signInWithPopup(auth, provider);
}

export async function signInAnonymous() {
	const { auth, signInAnonymously } = await import('./client');
	return await signInAnonymously(auth);
}

export async function signOut() {
	const { auth, signOut } = await import('./client');
	return await signOut(auth);
}
