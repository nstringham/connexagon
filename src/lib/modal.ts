import { mount, unmount, type Snippet } from "svelte";
import Modal from "./Modal.svelte";

export type ModalHandel<T = void> = {
  returnValue: Promise<T>;
  close(): void;
};

export function showModal(children: Snippet, { preventCancel }: { preventCancel?: boolean } = {}) {
  return new Promise<void>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- this is ok because we have no exports
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
