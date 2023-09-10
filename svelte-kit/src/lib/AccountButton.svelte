<script lang="ts">
	import '$lib/hexagon-button';
	import '@material/web/dialog/dialog';

	import googleIcon from './google.svg';
	import twitterIcon from './twitter.svg';
	import accountIcon from './account-box.svg';

	let dialogOpen = false;

	const tosUrl =
		'https://docs.google.com/document/d/e/2PACX-1vTSm5LEWQU3DrYICskZIDJMwlin34xfYl8BGSw5y6FPRlwx7llt2t8yPRsJUQ1RQ9a3C2dTBO9f5Hof/pub';
	const privacyPolicyUrl =
		'https://docs.google.com/document/d/e/2PACX-1vRlv-yOzN6jEaN03HyFDRURWSIb89O3a-OLYxNF9JBSq-rnDhDUxI5B-jTO_K7UagNTuyVf2a8Bi69z/pub';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
<hexagon-filled-button on:click={() => (dialogOpen = true)}> Sign in </hexagon-filled-button>

<md-dialog open={dialogOpen} on:close={() => (dialogOpen = false)}>
	<div slot="headline">Sign in to Connexagon</div>
	<div slot="content" class="button-stack">
		<hexagon-filled-button>
			<div slot="icon" class="brand-logo" style="--mask: url({googleIcon})" />
			<span>Continue with Google</span>
		</hexagon-filled-button>
		<hexagon-filled-button>
			<div slot="icon" class="brand-logo" style="--mask: url({twitterIcon})" />
			<span>Continue with X</span>
		</hexagon-filled-button>
		<hexagon-filled-button>
			<div slot="icon" class="brand-logo" style="--mask: url({accountIcon})" />
			<span>Continue as guest</span>
		</hexagon-filled-button>
		<div class="legal">
			By continuing you are agreeing to the<br />
			<a target="blank" rel="noreferrer" href={tosUrl}>terms of service</a>
			and
			<a target="blank" rel="noreferrer" href={privacyPolicyUrl}>privacy policy</a>.
		</div>
	</div>
</md-dialog>

<style>
	hexagon-filled-button:not(:defined) {
		visibility: hidden;
		height: 40px;
	}

	md-dialog:not(:defined) {
		display: none;
	}

	.button-stack {
		display: grid;
		gap: 12px;
	}

	.brand-logo {
		position: absolute;
		left: 16px;
		background-color: currentColor;
		mask-image: var(--mask);
		-webkit-mask-image: var(--mask);
		mask-size: contain;
		-webkit-mask-size: contain;

		& + span {
			margin-left: 24px;
		}
	}

	.legal {
		font-size: var(--label-s-font-size);
	}

	md-dialog {
		--md-dialog-container-shape: 0px;
	}
</style>
