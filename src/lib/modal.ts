import { mount, unmount, type Snippet } from "svelte";
import Modal from "./Modal.svelte";

export function showModal(children: Snippet, { preventCancel }: { preventCancel?: boolean } = {}) {
  return new Promise<void>((resolve) => {
    const modal = mount(Modal, {
      target: document.getElementById("modal-container")!,
      props: {
        children,
        preventCancel,
        onclose: async () => {
          await unmount(modal);
          resolve();
        },
      },
    });
  });
}
