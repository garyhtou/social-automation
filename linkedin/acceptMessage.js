/* 
Run on profile which sent you a connection request.
It will accept the request and prefill a message to the person.
*/

function run() {
	// find accept button
	let acceptButton = document.querySelector(".pv-s-profile-actions--accept");

	if (!acceptButton) {
		// if doesn't exist
		return "No Accept button found.";
	}

	// Accept the request
	acceptButton.click();

	//open a new message
	document
		.querySelector("button[data-control-name='overlay.compose_message']")
		.click();

	var observers = [];

	//find the message overlay
	let messages = Array.prototype.slice.call(
		document.querySelectorAll("div.msg-overlay-conversation-bubble")
	);
	for (let message of messages) {
		// if it is a new message
		if (
			message.querySelector("h4").innerText === "New message" &&
			message
				.querySelector("div.msg-connections-typeahead__added-recipients")
				.querySelectorAll("button").length === 0
		) {
			// customize

			let personalizeMessage = generatePersonalizeMessage();

			let textbox = message.querySelector("form div[role='textbox']");
			// remove existing message
			while (textbox.firstChild) {
				textbox.removeChild(textbox.firstChild);
			}
			// add custom message
			for (line of personalizeMessage) {
				textbox.appendChild(line);
			}
			textbox.dispatchEvent(
				new Event("input", {
					bubbles: true,
					cancelable: true,
				})
			);

			// hide placeholder
			let placeholder = message.querySelector("form div.msg-form__placeholder");
			placeholder.className += " hidden";
			placeholder.className = placeholder.className.replace(
				new RegExp("(\\s|^)" + "visible" + "(\\s|$)"),
				" "
			);

			// select recipient
			let recipentField = message.getElementsByClassName(
				"msg-connections-typeahead__added-recipients"
			)[0];
			recipentField.querySelector("input").value = document.querySelector(
				"div ul.pv-top-card--list li"
			).innerText;
			recipentField.querySelector("input").dispatchEvent(
				new Event("input", {
					bubbles: true,
					cancelable: true,
				})
			);
			recipentField.click();

			let observer = new MutationObserver((mutationList, observer) => {
				// get a search results
				let recipentSearchResults = Array.prototype.slice.call(
					message.querySelectorAll(
						"div.msg-connections-typeahead__search-results ul li"
					)
				);

				if (recipentSearchResults.length === 0) {
					return;
				}

				let pageProfilePicLink = document.querySelector(
					"div.pv-top-card__image img[alt='" +
						document.querySelector("div ul.pv-top-card--list li").innerText +
						"']"
				).src;
				for (let person of recipentSearchResults) {
					let profilePicLink = person.querySelector(
						"img[alt='" +
							document.querySelector("div ul.pv-top-card--list li").innerText +
							"']"
					).src;

					// if profile pictures match, select this person
					if (
						pageProfilePicLink.split("/")[5] === profilePicLink.split("/")[5]
					) {
						//select person
						person.querySelector("button").click();

						//disconnect all observers
						observers.map((ob) => ob.disconnect());

						// undisable Send button
						message.querySelector(
							"button.msg-form__send-button"
						).disabled = false;

						break;
					}
				}
			});
			observers.push(observer);
			observer.observe(message, { childList: true, subtree: true });

			break;
		}
	}
	return "Message prefilled.";
}
function generatePersonalizeMessage() {
	var message = [];

	let name = document.querySelector("div ul.pv-top-card--list li").innerText;

	messageLine(`Hello ${name.split(" ")[0]},`);
	newLine();
	messageLine("Insert your message body here");
	newLine();
	messageLine("Best,");
	messageLine("Your Name");

	return message;

	// helper methods
	function messageLine(text) {
		let node = document.createElement("p");
		node.innerText = text;
		message.push(node);
	}

	function newLine() {
		message.push(document.createElement("br"));
	}
}
run();
