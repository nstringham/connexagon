import { showToast } from "./Toasts.svelte";

export function getErrorMessage(error: unknown): string {
  if (typeof error == "string") {
    return error;
  }

  if (
    typeof error == "object" &&
    error != null &&
    "message" in error &&
    typeof error.message == "string"
  ) {
    return error.message;
  }

  console.error("unknown error", error);
  return String(error);
}

export function toastError(error: unknown) {
  console.error(error);

  const message = getErrorMessage(error);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- this is just eslint getting confused by svelte
  showToast({ message, style: "error" });
}

export async function assertOk(response: Response | Promise<Response>): Promise<Response> {
  response = await response;

  if (response.ok) {
    return response;
  }

  if (response.headers.get("Content-Type")?.startsWith("application/json")) {
    throw await response.json();
  } else {
    throw await response.text();
  }
}
