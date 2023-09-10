import { customElement } from 'lit/decorators.js';
import { css } from 'lit';
import { Button } from '@material/web/button/internal/button.js';
import { styles as filledStyles } from '@material/web/button/internal/filled-styles.css.js';
import { styles as sharedStyles } from '@material/web/button/internal/shared-styles.css.js';

@customElement('hexagon-filled-button')
export class HexagonFilledButton extends Button {
	static override styles = [
		sharedStyles,
		filledStyles,
		css`
			:host {
				--_container-shape: 0px;
			}
			.button::before,
			.button > md-ripple {
				mask-image: paint(hexagon);
				-webkit-mask-image: paint(hexagon);
			}
		`
	];
}

declare global {
	interface HTMLElementTagNameMap {
		'hexagon-filled-button': HexagonFilledButton;
	}
}
