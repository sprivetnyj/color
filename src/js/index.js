//================================================================================

import { map } from './paths.js';
import { audio } from './audio.js';

//================================================================================

const mode = 'prod';
vkBridge.send('VKWebAppInit');

//================================================================================

// Холст
const canvas = document.querySelector('canvas');
canvas.getContext('2d');

// Параметры размера холста
const w = 360;
const h = 640;
const ratio = h / w;

canvas.width = w;
canvas.height = h;

let scale = 1;

//================================================================================

// Элементы HTML
const elmWrapper = document.querySelector('.wrapper');
const elmScreens = document.querySelectorAll('.screen');
const elmScreenStart = document.querySelector('.screen--start');
const elmScreenGame = document.querySelector('.screen--game');
const elmScreenEnd = document.querySelector('.screen--end');

const elmShapeContainer = elmScreenGame.querySelector('.shape-container');
const elmShapePreviewContainer = elmScreenGame.querySelector('.shape-preview-container');

const elmPlay = document.querySelector('.play');
const elmPost = document.querySelector('.post');
const elmInvite = document.querySelector('.invite');
const elmHome = document.querySelector('.home');
const elmRestart = document.querySelector('.restart');
const elmBack = document.querySelector('.back');
const elmReward = document.querySelector('.reward');
const elmScore = document.querySelector('.score');

const elmResult = document.querySelector('.result');
const elmHighscore = document.querySelector('.highscore');
const elmFinish = document.querySelector('.finish');

const preloader = document.querySelector('.preloader');

//================================================================================

// Состояние игры
let game = false;
let lvlCompleted = false;
let ad = -1;

// Очки игрока
let lvl;
let userHelp;

let lastSound = true;


vkBridge.send('VKWebAppStorageGet', { 'keys': ['lvl3', 'help0'] })
	.then(data => {
		console.log(data.keys[1].value);
		if (!data.keys[0].value.length) data.keys[0].value = '0';
		if (!data.keys[1].value.length && data.keys[1].value !== 0) data.keys[1].value = '3';
		data.keys[1].value
		lvl = data.keys[0].value;
		userHelp = data.keys[1].value;
		elmScore.textContent = Number(lvl) + 1;
		setTimeout(() => {
			preloader.classList.add('hidden');
		}, 1000);
	})
setTimeout(() => {
	preloader.classList.add('hidden');
}, 2000);


//================================================================================

// Запуск новой игровой сессии
function gameStart() {
	game = true;
	// setTimeout(() => {
	// 	// elmResult.classList.remove('record');
	// }, 1000);
}

//================================================================================

// Остановка игры
// function gameEnd() {
// 	game = false;
// 	createSound(sndEnd);

// 	// Показ рекламы + показ экрана конца игры
// if (mode === 'prod') {
// 	setTimeout(() => {
// 		vkBridge.send("VKWebAppCheckNativeAds", { "ad_format": "interstitial" })
// 			.then(() => {
// 				vkBridge.send("VKWebAppShowNativeAds", { "ad_format": "interstitial" })
// 			})
// 		showResult();
// 	}, 500);
// } else {
// 	setTimeout(() => {
// 		showResult();
// 	}, 500);
// }
// }

//================================================================================

// function showResult() {
// 	const oldUserScore = userScore;
// 	// Обнуление очков игрока
// 	userScore = 0;
// 	// Проверка на достижение нового рекорда
// 	if (mode === 'prod') {
// 		vkBridge.send('VKWebAppStorageGet', { 'keys': ['lvl3'] })
// 			.then(data => {
// 				if (oldUserScore > data.keys[0].value) {
// 					highScore = oldUserScore;
// 					// Записываем рекорд в ключ хранилища
// 					vkBridge.send('VKWebAppStorageSet', { key: 'lvl3', value: String(highScore) });
// 					// Обновляем рекорд на стартовом экране
// 					elmHighscore.firstElementChild.textContent = highScore;
// 					// Показываем строчку с новым рекордом
// 					elmResult.classList.add('record');
// 					setTimeout(() => {
// 						createSound(sndRecord);
// 					}, 1000);
// 				}
// 			})
// 	} else {
// 		if (oldUserScore > highScore) {
// 			highScore = oldUserScore;
// 			elmHighscore.firstElementChild.textContent = highScore;
// 			elmResult.classList.add('record');
// 			setTimeout(() => {
// 				createSound(sndRecord);
// 			}, 1000);
// 		}
// 	}

// 	// Показ очков за текущую игру
// 	elmResult.firstElementChild.textContent = oldUserScore;

// 	// Показ экрана конца игры
// 	newScreen(elmScreenEnd);
// }

//================================================================================

let elmShape, shapeOrders, elmShapeBg, elmShapePreview, steps, elmShapePaths, elmShapeButtons, index, delay, helpText;

setTimeout(() => {
	createLvl(lvl);
	elmReward.firstElementChild.textContent = userHelp;
	elmReward.lastElementChild.textContent = getNoun(userHelp);

	helpText = getNoun(userHelp);

	// helpText = 'подсказка?';
	// elmReward.classList.add('show');
}, 2000);

function createLvl(i) {
	ad++;
	if (ad > 0) {
		if (ad % 3 === 0) {
			vkBridge.send("VKWebAppCheckNativeAds", { "ad_format": "interstitial" })
				.then(() => {
					vkBridge.send("VKWebAppShowNativeAds", { "ad_format": "interstitial" })
				})
		}
	}

	elmShapeContainer.insertAdjacentHTML('afterbegin', map[i]);

	elmShape = elmShapeContainer.querySelector('svg');
	shapeOrders = elmShape.getAttribute('data-order').split(';').map(shapeOrder => shapeOrder.split(','));

	elmShapeBg = elmShape.cloneNode(true);
	elmShapePreview = elmShape.cloneNode(true);

	elmShape.classList.add('shape');

	index = -1;

	Array.from(elmShape.children).forEach(element => {
		if (((element.tagName !== 'circle' || element.classList.contains('circle'))) && element.parentElement.tagName !== 'g') {
			element.classList.add('shape__path');
		} else {
			if (element.tagName === 'circle' && !element.classList.contains('circle')) {
				index++;
				element.insertAdjacentHTML('beforebegin', `<g class="shape__button" data-index="${index}">`);

				const elmShapeButton = element.previousElementSibling;
				const elmShapeCircle = element;
				const elmShapeCirclePath = element.nextElementSibling;

				element.nextElementSibling.remove();
				element.remove();

				elmShapeButton.insertAdjacentElement('afterbegin', elmShapeCircle);
				elmShapeButton.insertAdjacentElement('beforeend', elmShapeCirclePath);
			}
		}
	});

	steps = [];
	elmShapePaths = Array.from(elmShape.querySelectorAll('.shape__path'));
	elmShapeButtons = Array.from(elmShape.querySelectorAll('.shape__button'));

	elmShapePaths.forEach((path, index) => {
		path.setAttribute('data-index', index);
		path.remove();
	});

	createSvgElement(elmShapeBg);
	createSvgElement(elmShapePreview);

	function createSvgElement(element) {
		if (element === elmShapeBg) {
			element.classList.add('bg');
		} else {
			element.classList.add('shape-preview');
		}
		element.removeAttribute('data-order');
		let shapeBgPaths = true;
		Array.from(element.children).forEach(el => {
			if (el.tagName === 'circle' && !el.classList.contains('circle')) shapeBgPaths = false;
			if (!shapeBgPaths) {
				el.remove();
			} else {
				if (element === elmShapeBg) {
					el.setAttribute('fill', '#e6f7ff');
				}
			}
		});
		if (element === elmShapeBg) {
			elmShape.insertAdjacentElement('beforebegin', element);
		} else {
			elmShapePreviewContainer.insertAdjacentElement('afterbegin', element);
		}
	}
}

//================================================================================

newScreen(elmScreenGame);
gameStart();

document.addEventListener('click', (e) => {
	const el = e.target;
	// Старт игры
	if (el === elmPlay) {
		// newScreen(elmScreenGame);
		// gameStart();
		// Опубликовать пост
	} else if (el === elmPost) {
		const printScores = elmHighscore.firstElementChild.textContent;
		vkBridge.send('VKWebAppStorageGet', { 'keys': ['userHighscore'] })
			.then(() => {
				vkBridge.send('VKWebAppShowWallPostBox', {
					'message': `Мой рекорд в игре Game - ${printScores} ${getNoun(printScores)}! сможешь побить?\n\nOrby Games (vk.com/orby.games) - бесплатные игры для ВКонтакте. Присоединяйтесь!\n\n#игры #vkgames #directgames`,
					'attachments': 'https://vk.com/appId'
				})
			});
		// Пригласить друга
	} else if (el === elmInvite) {
		vkBridge.send('VKWebAppShowInviteBox')
	} else if (el === elmRestart) {
		newScreen(elmScreenGame);
		gameStart();
		// Вернуться на главный экран
	} else if (el === elmHome) {
		audio.Click.play();
		// newScreen(elmScreenStart);
		// Перемещение экрана игры слева на изначальное право со старта
		// toggleClasses([elmScreenGame], 'remove', ['hidden', 'hidden--left']);
		// toggleClasses([elmScreenGame], 'add', ['hidden', 'hidden--right']);
		// Клик во время игры
	} else {
		if (game) {
			if (el.closest('.shape__button')) {
				if (!el.parentElement.classList.contains('disabled')) {
					if (!steps.length) elmBack.classList.remove('hidden');
					elmShapePaths.forEach(path => {
						if (path.getAttribute('data-index') === el.parentElement.getAttribute('data-index')) {
							elmShape.insertAdjacentElement('beforeend', path);
							steps.push(path);
							el.parentElement.classList.add('disabled');
							if (elmShapeButtons.length === steps.length) {
								checkLastPath();
							}
						}
					});
					if (lastSound) audio.Path.play();
				}
			} else if (el === elmBack) {
				if (elmShape.lastElementChild.classList.contains('shape__path')) {
					steps.splice(steps.length - 1, 1);
					elmShapeButtons.forEach(button => {
						if (button.getAttribute('data-index') === elmShape.lastElementChild.getAttribute('data-index')) {
							button.classList.remove('disabled');
						}
					});
					elmShape.lastElementChild.remove();
					if (!steps.length) elmBack.classList.add('hidden');
					audio.Path.play();
				}
			}
			else if (el.closest('.reward')) {
				if (userHelp > 0) {
					userHelp--;

					vkBridge.send('VKWebAppStorageGet', { 'keys': ['help0'] })
						.then(() => {
							// Записываем подсказки в ключ хранилища
							vkBridge.send('VKWebAppStorageSet', { key: 'help0', value: String(userHelp) });
						});

					if (userHelp < 1) {
						helpText = 'подсказка?';
						elmReward.classList.add('show');
					} else {
						helpText = getNoun(userHelp);
					}

					showPath();
					if (lastSound) audio.Path.play();
				} else {
					// Показ рекламы + показ экрана конца игры
					vkBridge.send("VKWebAppCheckNativeAds", { "ad_format": "reward" })
						.then(() => {
							vkBridge.send("VKWebAppShowNativeAds", { "ad_format": "reward", "use_waterfall": true })
								.then(() => {
									userHelp = 3;

									vkBridge.send('VKWebAppStorageGet', { 'keys': ['help0'] })
										.then(() => {
											// Записываем подсказки в ключ хранилища
											vkBridge.send('VKWebAppStorageSet', { key: 'help0', value: String(userHelp) });
										})

									helpText = getNoun(userHelp);
									elmReward.classList.remove('show');
									updateReward();
								})
								.catch(() => {
									helpText = 'нет рекламы';
									elmReward.classList.add('error');
									updateReward();
								})
						})
					audio.Click.play();
				}
				updateReward();
			}
		}
	}
	// Если клик по кнопке, то увеличим ее 
	if (el.closest('button')) animState([el.closest('button')], 200);
})

//================================================================================

function updateReward() {
	elmReward.firstElementChild.textContent = userHelp;
	elmReward.lastElementChild.textContent = helpText;
}

//================================================================================

function checkLastPath() {
	const stepsOrder = steps.map((step) => step.getAttribute('data-index'));
	shapeOrders.forEach(shapeOrder => {
		if (JSON.stringify(shapeOrder) === JSON.stringify(stepsOrder)) {
			audio.Confetti.play();
			lastSound = false;
			toggleClasses([elmHome, elmScore, elmBack, elmReward], 'add', ['hidden'], 0);
			confetti({
				particleCount: 100,
				spread: 70,
				gravity: 1.5,
				scalar: 1.2,
				origin: { y: 0.7 }
			});
			delay = 2500;
			if (lvl >= 59) {
				if (!lvlCompleted) {
					elmFinish.classList.remove('hidden');
					delay = 4000;
					setTimeout(() => {
						elmFinish.classList.add('hidden');
					}, delay);
				}
				lvlCompleted = true;
			}
			setTimeout(() => {
				!lvlCompleted ? lvl++ : lvl = Math.floor(Math.random() * 59);
				elmScore.textContent = lvl + 1;

				vkBridge.send('VKWebAppStorageGet', { 'keys': ['lvl3'] })
					.then(() => {
						// Записываем рекорд в ключ хранилища
						vkBridge.send('VKWebAppStorageSet', { key: 'lvl3', value: String(lvl) });
					})

				lastSound = true;
				toggleClasses([elmHome, elmScore, elmReward], 'remove', ['hidden'], 0);
				elmShape.remove();
				elmShapeBg.remove();
				elmShapePreview.remove();
				createLvl(lvl);
			}, delay);
		}
	});
}

//================================================================================

function showPath() {
	if (steps.length) {
		const stepsOrder = steps.map((step) => step.getAttribute('data-index'));
		for (let i = 0; i < shapeOrders.length; i++) {
			const shapeOrder = shapeOrders[i];
			for (let j = 0; j < shapeOrder.length; j++) {
				const orderIndex = shapeOrder[j];
				if (stepsOrder[j]) {
					if (stepsOrder[j] !== orderIndex) {
						if (i === shapeOrders.length - 1) {
							elmShapeButtons.forEach(shapeButton => {
								if (shapeButton.getAttribute('data-index') === steps[steps.length - 1].getAttribute('data-index')) {
									shapeButton.classList.remove('disabled');
								}
							});
							steps[steps.length - 1].remove();
							steps.splice(steps.length - 1, 1);
							i = shapeOrders.length;
							break;
						} else {
							break;
						}
					}
				} else {
					elmShape.insertAdjacentElement('beforeend', elmShapePaths[orderIndex]);
					steps.push(elmShapePaths[orderIndex]);
					elmShapeButtons.forEach(shapeButton => {
						if (shapeButton.getAttribute('data-index') === elmShapePaths[orderIndex].getAttribute('data-index')) {
							shapeButton.classList.add('disabled');
						}
					});
					if (elmShapeButtons.length === steps.length) checkLastPath();
					i = shapeOrders.length;
					break;
				}
			}
		}
	} else {
		const path = elmShapePaths[shapeOrders[0][0]];
		elmShape.insertAdjacentElement('beforeend', path);
		steps.push(path);
		elmShapeButtons.forEach(shapeButton => {
			if (shapeButton.getAttribute('data-index') === path.getAttribute('data-index')) {
				shapeButton.classList.add('disabled');
			}
		});
		elmBack.classList.remove('hidden');
	}
}

//================================================================================

// Анимация увеличения элемента
function animState(elements, delay) {
	elements.forEach(element => {
		element.classList.add('scale');
		setTimeout(() => {
			element.classList.remove('scale');
		}, delay);
	});
}

//================================================================================

// Переключение состояния игры вместе с UI
function newScreen(newScreen) {
	elmScreens.forEach(screen => {
		let oldScreenSide = 'hidden--left';
		let newScreenSide = 'hidden--right';
		if (newScreen.classList.contains('hidden--left')) {
			oldScreenSide = 'hidden--right';
			newScreenSide = 'hidden--left';
		}
		if (!screen.classList.contains('hidden')) {
			toggleClasses([screen], 'add', ['hidden', oldScreenSide], 0);
		} else if (screen === newScreen) {
			toggleClasses([screen], 'remove', ['hidden', newScreenSide], 0);
		}
	});
}

//================================================================================

// Переключение стилей UI элементов с учетом задержки
function toggleClasses(elements, state, classArray, delay = 0) {
	setTimeout(() => {
		elements.forEach(el => {
			classArray.forEach(classIndex => {
				if (state === 'add') {
					el.classList.add(classIndex);
				} else {
					el.classList.remove(classIndex);
				}
			});
		});
	}, delay);
}

//================================================================================

// Создание звука
// function createSound(path) {
// 	const sound = new Audio();
// 	const src = `./${path.split('../')[1]}`;
// 	const name = src.split('audio/')[1].split('.')[0];
// 	sound.src = src;
// 	sounds[name] = sound;
// 	sounds[name].play();
// }

//================================================================================

// Окончание для числа
function getNoun(number) {
	let n = Math.abs(number);
	n %= 100;
	if (n >= 5 && n <= 20) return 'подсказок';
	n %= 10;
	if (n === 1) return 'подсказка';
	if (n >= 2 && n <= 4) return 'подсказки';
	return 'подсказок';
}

//================================================================================

// Подстраивание пропорций холста под экран
function resizeCanvas() {
	const currentRatio = window.innerHeight / window.innerWidth;
	if (ratio > currentRatio) {
		canvas.width = window.innerHeight / ratio;
		canvas.height = window.innerHeight;
		scale = window.innerHeight / h;
		elmWrapper.style = `--scale:${scale}`;
	} else {
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth * ratio;
		scale = window.innerWidth / w;
		elmWrapper.style = `--scale:${scale}`;
	}
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

//================================================================================
