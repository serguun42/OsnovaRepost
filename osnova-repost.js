// ==UserScript==
// @name         Osnova Repost
// @website      https://serguun42.ru/
// @version      1.1.0-R (2020-06-18)
// @author       serguun42
// @icon         https://tjournal.ru/static/build/tjournal.ru/favicons/favicon.ico
// @match        https://tjournal.ru/*
// @match        https://dtf.ru/*
// @match        https://vc.ru/*
// @updateURL    https://serguun42.ru/tampermonkey/osnova-repost/osnova-repost.js
// @downloadURL  https://serguun42.ru/tampermonkey/osnova-repost/osnova-repost.js
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @description  Reposts For TJ, DTF and vc.ru
// ==/UserScript==





const
	SITE = window.location.hostname.split(".")[0],
	RESOURCES_DOMAIN = "serguun42.ru";



/**
 * @param {String} iKey
 * @returns {Promise.<HTMLElement>}
 */
const GlobalWaitForElement = iKey => {
	if (iKey === "document.body") {
		if (document.body) return Promise.resolve(document.body);

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (document.body) {
					clearInterval(interval);
					resolve(document.body);
				};
			}, 50);
		});
	} else {
		if (document.querySelector(iKey)) return Promise.resolve(document.querySelector(iKey));

		return new Promise((resolve) => {
			let interval = setInterval(() => {
				if (document.querySelector(iKey)) {
					clearInterval(interval);
					resolve(document.querySelector(iKey));
				};
			}, 50);
		});
	};
};

/**
 * @callback AnimationStyleSettingFunc
 * @param {Number} iProgress
 */
/**
 * @param {Number} iDuration
 * @param {AnimationStyleSettingFunc} iStyleSettingFunc - Function for setting props by progress
 * @param {"ease-in-out"|"ripple"|"linear"} [iCurveStyle="ease-in-out"] - Curve Style
 * @returns {Promise<null>}
 */
const GlobalAnimation = (iDuration, iStyleSettingFunc, iCurveStyle = "ease-in-out") => new Promise((resolve) => {
	let startTime = performance.now();


	let LocalAnimation = iPassedTime => {
		iPassedTime = iPassedTime - startTime;
		if (iPassedTime < 0) iPassedTime = 0;

		if (iPassedTime < iDuration) {
			let cProgress = iPassedTime / iDuration;

			if (iCurveStyle == "ease-in-out") {
				if (cProgress < 0.5)
					cProgress = Math.pow(cProgress * 2, 2.75) / 2;
				else
					cProgress = 1 - Math.pow((1 - cProgress) * 2, 2.75) / 2;
			} else if (iCurveStyle == "ripple") {
				cProgress = 0.6 * Math.pow(cProgress, 1/3) + 1.8 * Math.pow(cProgress, 2/3) - 1.4 * cProgress;
			};


			iStyleSettingFunc(cProgress);

			requestAnimationFrame(LocalAnimation);
		} else
			return resolve();
	};

	requestAnimationFrame(LocalAnimation);
});

/**
 * @param {HTMLElement} iElem
 * @returns {void}
 */
const GlobalRemove = iElem => {
	if (iElem instanceof HTMLElement)
		(iElem.parentElement || iElem.parentNode).removeChild(iElem);
};

/**
 * @param {String} iLink
 * @param {String} [iDataFor]
 */
const GlobalAddStyle = (iLink, iDataFor = false) => {
	let stylesNode = document.createElement("link");
		stylesNode.setAttribute("data-author", "serguun42");
		
	if (iDataFor)
		stylesNode.setAttribute("data-for", iDataFor);
	else
		stylesNode.setAttribute("data-for", "site");


		stylesNode.setAttribute("rel", "stylesheet");
		stylesNode.setAttribute("href", iLink);


	GlobalWaitForElement("document.body").then(() => {
		document.body.appendChild(stylesNode);
	});
};

/**
 * @param {String} iLink
 * @param {String} [iDataFor]
 */
const GlobalAddScript = (iLink, iDataFor = false) => {
	let scriptNode = document.createElement("script");
		scriptNode.setAttribute("data-author", "serguun42");
		
	if (iDataFor)
		scriptNode.setAttribute("data-for", iDataFor);
	else
		scriptNode.setAttribute("data-for", "site");


	scriptNode.setAttribute("src", iLink);



	GlobalWaitForElement("document.body").then((body) => {
		document.body.appendChild(scriptNode);
	});
};




GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/mdl-switchers-and-inputs.css`, "osnova");
GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/material-icons.css`, "osnova");
GlobalAddScript(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/getmdl.min.js`, "osnova");
GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/osnova-repost-styles.css`, "osnova");
GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/${SITE}.css`, "site");
GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/non-theme-bc-colors.css`, "non-theme-bc-colors");





GlobalWaitForElement(".main_menu__auth").then(() => {
	/**
	 * @param {HTMLElement} iContainer
	 * @param {String} [iAdditionalClass]
	 */
	const LocalAddRepostBtnToContainer = (iContainer, iAdditionalClass = "") => {
		let repostBtn = document.createElement("div");
			repostBtn.innerHTML = `<i class="material-icons material-icons-round">autorenew</i>`;
			repostBtn.id = "s42-switcher-repost-btn";
			repostBtn.className = `mdl-js-button mdl-js-ripple-effect ${iAdditionalClass}`;
			repostBtn.addEventListener("click", (e) => {
				const REPOST_LAYOUT = `<div id="repost-layout__header">Репосты</div>
<div class="repost-layout__list">
	<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" data-serguun42-repost-mdl>
		<input class="mdl-textfield__input" type="text" id="repost-token-field">
		<label class="mdl-textfield__label" for="repost-token-field">Токен</label>
	</div>
</div>
<div class="repost-layout__list">
	<div id="repost-layout__chech-token-btn" class="mdl-js-button mdl-js-ripple-effect" data-serguun42-repost-mdl>Проверить токен</div>
</div>


<div id="repost-layout__rest" class="is-hidden">
	<div id="repost-layout__rest__obfuscator"></div>


	<ul id="repost-layout__list">
		<div class="repost-layout__list__subheader">Что делать</div>
		<li class="repost-layout__list__item">
			<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="repost-create" data-serguun42-repost-mdl>
				<input type="radio" id="repost-create" class="mdl-radio__button" name="repost-method" value="create" checked>
				<span class="mdl-radio__label">Сделать репост</span>
			</label>
		</li>
		<li class="repost-layout__list__item">
			<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="repost-remove" data-serguun42-repost-mdl>
				<input type="radio" id="repost-remove" class="mdl-radio__button" name="repost-method" value="remove">
				<span class="mdl-radio__label">Удалить репост</span>
			</label>
		</li>


		<div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label" data-serguun42-repost-mdl>
			<input class="mdl-textfield__input" type="text" id="repost-post-id-field">
			<label class="mdl-textfield__label" for="repost-post-id-field">ID поста для репоста</label>
		</div>


		<div class="repost-layout__list__subheader">Выбор подсайта/блога</div>
		<div id="repost-layout__list__subsite-selector"></div>

		<div id="repost-layout__do-method-btn" class="mdl-js-button mdl-js-ripple-effect" data-serguun42-repost-mdl>Выполнить запрос с выбранным подсайтом</div>
	</ul>
</div>`;

				let repostContainer = document.createElement("div");
					repostContainer.id = "repost-layout";
					repostContainer.style.width = 0;
					repostContainer.style.height = 0;
					repostContainer.style.right = (window.innerWidth - e.clientX) + "px";

				document.body.appendChild(repostContainer);


				let repostScroller = document.createElement("div");
					repostScroller.id = "repost-layout--scroller";

				repostContainer.appendChild(repostScroller);
				repostScroller.innerHTML = REPOST_LAYOUT;

				let repostObfuscator = document.createElement("div");
					repostObfuscator.id = "repost-layout--obfuscator";
				document.body.appendChild(repostObfuscator);



				GlobalAnimation(4e2, (iProgress) => {
					repostContainer.style.width = iProgress * 500 + "px";
					repostContainer.style.height = iProgress * 500 + "px";
					if (iProgress < 0.25)
						repostContainer.style.opacity = iProgress * 4;
					else
						repostContainer.style.opacity = 1;
				}).then(() => {
					repostContainer.style.width = "500px";
					repostContainer.style.height = "500px";
					repostContainer.style.opacity = 1;
					repostScroller.style.overflowY = "auto";
				});



				if (localStorage.tokenForReposts) {
					document.getElementById("repost-token-field").value = localStorage.tokenForReposts;
				};

				document.getElementById("repost-layout__chech-token-btn").addEventListener("click", () => {
					const token = document.getElementById("repost-token-field").value;

					if (!token) alert("Нет токена!");


					GM_xmlhttpRequest({
						method: "GET",
						headers: {
							"X-Device-Token": token
						},
						url: `https://api.${SITE}.ru/v1.8/user/me`,
						responseType: "text",
						onload: (response) => {
							if (response.status !== 200) return alert("Нерабочий токен");

							let userID,
								userName;

							try {
								userID = JSON.parse(response.response).result.id;
								userName = JSON.parse(response.response).result.name;
							} catch (e) {
								return;
							};


							GlobalAddStyle(`https://${RESOURCES_DOMAIN}/tampermonkey/osnova-repost/final.css?id=${userID}&name=${encodeURIComponent(userName)}&site=${SITE}&version=1.1.0`, "osnova");


							localStorage.tokenForReposts = token;

							GM_xmlhttpRequest({
								method: "GET",
								url: `https://api.${SITE}.ru/v1.8/subsites_list/sections`,
								responseType: "text",
								onload: (response) => {
									if (response.status !== 200) return alert("Не могу получить список подсайтов");

									let subsites = [];
									
									try {
										subsites = JSON.parse(response.response).result.map((subsite) => {
											return { name: subsite.name, id: subsite.id };
										});
									} catch (e) {
										return;
									};


									GlobalAnimation(4e2, (iProgress) => {
										document.getElementById("repost-layout__rest__obfuscator").style.opacity = 0.3 * (1 - iProgress);
									}, "ease-in-out").then(() => {
										GlobalRemove(document.getElementById("repost-layout__rest__obfuscator"));
									});

									let selection = [{ name: "Блог – " + userName, id: userID }].concat(subsites);


									document.getElementById("repost-layout__list__subsite-selector").innerHTML =
									selection.map((subsite, subsiteIndex) => `<li class="repost-layout__list__item">
										<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect" for="repost-selector-${subsite.id}" data-serguun42-repost-mdl>
											<input type="radio" id="repost-selector-${subsite.id}" class="mdl-radio__button" name="repost-select" value="${subsite.id}" ${!subsiteIndex ? "checked" : ""}>
											<span class="mdl-radio__label">${subsite.name}</span>
										</label>
									</li>`).join("\n");


									requestAnimationFrame(() =>
										componentHandler.upgradeElements(Array.from(document.querySelectorAll("[data-serguun42-repost-mdl]"))));

									setTimeout(() => {
										componentHandler.upgradeElements(Array.from(document.querySelectorAll("[data-serguun42-repost-mdl]")));
									}, 5e2);



									document.getElementById("repost-layout__do-method-btn").addEventListener("click", () => {
										let postID = document.getElementById("repost-post-id-field").value;
										if (!postID) return alert("Не указан ID поста");
										postID = parseInt(postID);
										if (!postID) return alert("Неверно указан ID поста");


										let method = "";
										document.querySelectorAll(`[name="repost-method"]`).forEach((methodRadio) => {
											if (methodRadio.checked) {
												method = methodRadio.getAttribute("value");
											};
										});

										if (!method) return alert("Не указано, что делать: создавать или удалять");


										let destination = "";
										document.querySelectorAll(`[name="repost-select"]`).forEach((destinationRadio) => {
											if (destinationRadio.checked) {
												destination = parseInt(destinationRadio.getAttribute("value"));
											};
										});

										if (!destination) return alert("Не указано, куда делать репост");



										GM_xmlhttpRequest({
											method: "POST",
											headers: {
												"Content-Type": "application/x-www-form-urlencoded",
												"X-Device-Token": token,
											},
											data: `content_id=${postID}&subsite_id=${destination}`,
											url: `https://api.${SITE}.ru/v2.0/repost/${method}`,
											responseType: "text",
											onload: (response) => {
												try {
													if (JSON.parse(response.response)["result"]["result"])
														alert("Успешно!");
													else
														alert(`Возникла ошибка:\n${response.response}`);
												} catch (e) {
													alert(`Возникла ошибка:\n${response.response}`);
												};
											}
										});
									});
								}
							})
						}
					});
				});



				if (typeof componentHandler !== "undefined") {
					componentHandler.upgradeElement(repostBtn);
					componentHandler.upgradeElements(Array.from(document.querySelectorAll("[data-serguun42-repost-mdl]")));

					requestAnimationFrame(() =>
						componentHandler.upgradeElements(Array.from(document.querySelectorAll("[data-serguun42-repost-mdl]"))));

					setTimeout(() => {
						componentHandler.upgradeElements(Array.from(document.querySelectorAll("[data-serguun42-repost-mdl]")));
					}, 5e2)
				};



				repostObfuscator.addEventListener("click", () => {
					repostScroller.style.overflowY = "hidden";

					GlobalAnimation(4e2, (iProgress) => {
						repostContainer.style.opacity = 1 - iProgress;
					}).then(() => {
						GlobalRemove(repostContainer);
						GlobalRemove(repostObfuscator);
					});
				});

				repostObfuscator.addEventListener("contextmenu", () => {
					repostScroller.style.overflowY = "hidden";

					GlobalAnimation(4e2, (iProgress) => {
						repostContainer.style.opacity = 1 - iProgress;
					}).then(() => {
						GlobalRemove(repostContainer);
						GlobalRemove(repostObfuscator);
					});

					return false;
				});
			});

		iContainer.appendChild(repostBtn);
		if ("componentHandler" in window) componentHandler.upgradeElement(repostBtn);
	};


	LocalAddRepostBtnToContainer(document.querySelector(".main_menu__auth"));


	GlobalWaitForElement("#custom-data-container").then((customDataContainer) => {
		GlobalRemove(document.getElementById("s42-switcher-repost-btn"));
		GlobalRemove(document.querySelector(`[data-for="non-theme-bc-colors"]`));
		LocalAddRepostBtnToContainer(customDataContainer, "s42-switcher-repost-btn--with-theme");
	});
});