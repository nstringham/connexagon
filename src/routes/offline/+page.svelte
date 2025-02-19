<svelte:head>
  <script type="module">
    if (location.pathname.startsWith("/offline")) {
      location.href = "/";
    }

    const title = document.querySelector("#title");
    const description = document.querySelector("#description");
    const reload = document.querySelector("#reload");

    if (!navigator.onLine) {
      title.innerHTML = "You are offline!";
      description.innerHTML = "Please connect to the internet to play Connexagon.";
      window.addEventListener("online", () => setTimeout(() => location.reload(), 500));
    }

    reload.addEventListener("click", (event) => {
      location.reload();
      event.preventDefault();
    });
  </script>

  <style>
    .offline-grid {
      margin: 0;
      min-height: 100svh;
      display: grid;
      place-content: center;
      justify-items: center;
    }

    header {
      display: none !important;
    }
  </style>
</svelte:head>

<form class="offline-grid">
  <h1 id="title">Cannot connect to server!</h1>
  <p id="description">Check your internet connection and try again.</p>
  <button id="reload" type="submit">Try Again</button>
</form>
