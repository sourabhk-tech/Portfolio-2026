/* Contact form: validate locally, POST to the Vercel function, and show a
   clear loading / success / error state. Falls back to a direct email link. */
(function () {
  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var status = form.querySelector("[data-form-status]");
  var button = form.querySelector("[data-submit-button]");
  var label = form.querySelector("[data-submit-label]");
  var inbox = "sourabhkumbhar7047@gmail.com";
  var defaultLabel = label ? label.textContent : "Send message";
  var submitting = false;

  function showStatus(message, state) {
    if (!status) return;
    status.hidden = false;
    status.className = "form-status" + (state ? " is-" + state : "");
    status.textContent = message;
  }

  function hideStatus() {
    if (!status || status.hidden) return;
    status.hidden = true;
    status.textContent = "";
    status.className = "form-status";
  }

  function setLoading(loading) {
    submitting = loading;

    if (button) {
      button.disabled = loading;
      button.classList.toggle("is-loading", loading);
      button.setAttribute("aria-busy", loading ? "true" : "false");
    }

    if (label) {
      label.textContent = loading ? "Sending\u2026" : defaultLabel;
    }

    form.setAttribute("aria-busy", loading ? "true" : "false");
  }

  function errorMessage() {
    return (
      "I couldn\u2019t send that just now. Please try again, or email me directly at " +
      inbox +
      "."
    );
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (submitting) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    var subject = String(data.get("subject") || "Portfolio enquiry").trim();
    var message = String(data.get("message") || "").trim();
    var company = String(data.get("company") || "").trim();

    var endpoint = form.getAttribute("action") || "/api/contact";
    var controller =
      typeof AbortController === "function" ? new AbortController() : null;
    var timer = null;

    if (controller) {
      timer = window.setTimeout(function () {
        controller.abort();
      }, 15000);
    }

    hideStatus();
    setLoading(true);

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        name: name,
        email: email,
        subject: subject,
        message: message,
        company: company,
        page: window.location.href
      }),
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        return response
          .json()
          .catch(function () {
            return {};
          })
          .then(function (result) {
            if (!response.ok) {
              throw new Error(
                (result && result.message) ||
                  "The message could not be sent right now."
              );
            }
            return result;
          });
      })
      .then(function () {
        form.reset();
        showStatus(
          "Thanks, " +
            (name.split(" ")[0] || "there") +
            ". Your message is on its way \u2014 I\u2019ll reply to " +
            email +
            " within 1\u20132 business days.",
          "success"
        );
      })
      .catch(function (error) {
        if (error && error.name === "AbortError") {
          showStatus(
            "That took longer than expected. Please try again, or email me directly at " +
              inbox +
              ".",
            "error"
          );
          return;
        }

        var detail = error && error.message ? String(error.message) : "";

        if (
          !detail ||
          /failed to fetch|networkerror|load failed|fetch failed/i.test(detail)
        ) {
          showStatus(errorMessage(), "error");
          return;
        }

        showStatus(
          detail +
            (detail.indexOf(inbox) === -1
              ? " You can also email me directly at " + inbox + "."
              : ""),
          "error"
        );
      })
      .finally(function () {
        if (timer) window.clearTimeout(timer);
        setLoading(false);
      });
  });

  form.addEventListener("input", hideStatus);
})();
