const orbs = ['sun', 'moon', 'star'];
const keyList = ['q', 'w', 'e', 'r', 'conj'];
const inputKeyList = ['KeyQ','KeyW','KeyE','KeyR'];

function loadAssets(assetPath) {
	const loaded = assetPath.map((path)=>{
		const img = new Image();
		img.src = './assets/' + path
		return img;
	});
	return loaded;
}

//이미지 로드

const circleImage = new Image();
circleImage.src = './assets/Wcircle.png';
const arrowImage = new Image();
arrowImage.src = './assets/sidearrow.png';

const celesSrc = ['sun.png','moon.png','star.png'];
const celesImage = loadAssets(celesSrc);

const skillSrc = ['Adina_Q.webp','Adina_W.webp','Adina_E.webp','Adina_R.webp'];
const skillImages = loadAssets(skillSrc);

const CskillSrc = ['Adina_QC.webp','Adina_WC.webp','Adina_EC.webp','Adina_R.webp'];
const CskillImages = loadAssets(CskillSrc);

const nonExistSFX = ["sunr","moonr","starr"];
const skillSFX = orbs.map(orb =>
	keyList.map(key => {
			let fileName = orb + key;
			if (!nonExistSFX.includes(fileName)) 
				return new Audio('./assets/sfx/'+ fileName +'.wav');
			else
				return null;
	})
);

//사운드 로드

const rSFX = [];
const conjrSFX = [];
for (let i = 0; i < 5; i++) {
	rSFX[i] = new Audio('./assets/sfx/r.wav');
	conjrSFX[i] = new Audio('./assets/sfx/conjr.wav');
}

const tickSFX = new Audio('./assets/sfx/tick.wav');
const deathSFX = new Audio('./assets/sfx/gameover.wav');

const voiceList = ['start1','start2','start3','conq','conw','cone','die1','die2','die3'];
const voiceLines = [];
for (let i = 0; i < 9; i++) {
	voiceLines[i] = new Audio('./assets/voice/' + voiceList[i] + '.mkv')
}

var celestialSlots = [];
var keySlots = [];
let score = 0;

let timeLimit = 3;
let isConjDone = false;
let isReadingStar;
let duringGame = false;
let interval; //타이머 표기에 사용


window.addEventListener('DOMContentLoaded', function () {
	volumeProgress();
	rrandomPortrait();
	document.querySelector(".start").addEventListener('click', function () {
		bootGame();
	})
	document.querySelector(".restart").addEventListener('click', function () {
		resetGame();
		bootGame();
	})
	document.getElementById("reset").addEventListener('click', function () { //통일성없는똥같은코드
		clearInterval(interval);
		gameOver();
		resetGame();
		bootGame();
	})
	const skllbtn = document.querySelectorAll(".scool")
	skllbtn.forEach(btn => {
		btn.addEventListener("click", function() {
			const btnId = this.id[0];
			inputHandler(btnId);
		})
	});
	window.addEventListener("keydown", (e) => {
		const keyName = keyList[inputKeyList.indexOf(e.code)];
		inputHandler(keyName);
	})
});


function inputHandler(key) {
	if (key == 'r' && celestialSlots[1] != undefined && duringGame) {
		changeSlot(key);
		updateGame();
	} else if (keyList.includes(key) && !isReadingStar && duringGame) {
		useSlot(key);
		updateGame();
	}
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function randomPortrait() {
	const p = document.querySelector(".portrait img")
	p.src = "./assets/Adina_portrait"+ getRandomInt(1,2)+".png"
}

function playSound(soundElement) {
	const soundType = soundElement.src;
	if (soundType.includes('voice') && !document.getElementById("novoice").checked) {
		return;
	} else if (soundType.includes('sfx') && !document.getElementById("nosfx").checked) {
		return;
	}
	soundElement.volume = document.getElementById("volume").value / 100;
	soundElement.play();
}

function playFrqntSound(soundArray) { //중복 재생해야 할 사운드의 경우 배열 자체를 인자로 전달
	for (let i = 0; i < soundArray.length; i++){
		if(soundArray[i].paused){
			playSound(soundArray[i]);
			return;
		}
	}
}

function volumeProgress() {
	const sElement = document.getElementById("volume")
	const sValue = sElement.value;
  sElement.style.background = `linear-gradient(to right, #0EB4FC ${sValue}%, #ccc ${sValue}%)`;
}

function resetGame() {
	celestialSlots = [];
	keySlots = [];
	score = 0;
	timeLimit = 3;
	isConjDone = false;
	document.querySelector(".scoreText").innerText = score;
	document.querySelector(".timeBar").classList.remove("running");
	document.querySelector("#conjUI img").src= "./assets/conjUI.png"
	randomPortrait();
	resetIcons();
}

function bootGame() {
	document.getElementById("reset").style.display = "none";
	document.querySelector(".gameMessage").classList.remove("gameOver");
	document.querySelector(".gameMessage").classList.add("gameStart");
	duringGame = true;
	isReadingStar = true;
	playSound(voiceLines[getRandomInt(0,3)]);
	fillSlot(6, function () {
		restartTimer();
		isReadingStar = false;
		document.getElementById("reset").style.display = "inline-block";
	})
}

function drawShapes() {
	for (let i = 0; i < 6; i++) {
		const fileName = 'c' + (i + 1);
		const updatingSRC = document.getElementById(fileName);
		if (i < celestialSlots.length) {
			let c = celestialSlots.map(item => orbs.indexOf(item));
			updatingSRC.src = celesImage[c[i]].src;
		} else {
			updatingSRC.src = circleImage.src;
		}

	}
}


async function fillSlot(amount, callback) {
	let queuedSlots = [];
	queuedSlots = JSON.parse(JSON.stringify(celestialSlots));
	for (let i = 0; i < amount; i++) { //불가능한 천체 목록 제작
		let indexi = queuedSlots.length; //채워야하는칸 = 길이
		let occurrences = {};
		let checkedOrb = [];
		let availableOrb = [];
		checkedOrb.push(queuedSlots[indexi - 1]); //연속된 칸에 같은천체가 올수없음
		if (indexi >= 3 && queuedSlots[indexi - 3] == queuedSlots[indexi - 1]) {
			checkedOrb.push(queuedSlots[indexi - 2]);
		}
		queuedSlots.forEach(item => {
			occurrences[item] = (occurrences[item] || 0) + 1;
		});
		queuedSlots.forEach(item => { //한 천체가 2개 이상 나올수 없음
			if (occurrences[item] >= 2 && !checkedOrb.includes(item)) {
				checkedOrb.push(item);
			}
		});
		availableOrb = orbs.filter(item => !checkedOrb.includes(item)); //일단 가능한 천체 목록 생성
		if (indexi == 4) { // 그런데 6번칸에는 1,2번칸과 다른 천체가 들어가야만 함.
			if (!queuedSlots.includes(queuedSlots[0])) { //... 그러므로 저장(1번)칸에 있는 천체는 적어도 5번칸에는 반드시 나와야 함.
				availableOrb = queuedSlots[0]
			} else if (!queuedSlots.includes(queuedSlots[1])) { // 혹은 2번칸에 있는 천체도 적어도 5번칸에선 나와야 함.
				availableOrb = queuedSlots[1]
			}
		}
		//천체 선정
		const randomOrbIndex = getRandomInt(0, availableOrb.length);
		const randomOrb = availableOrb[randomOrbIndex];
		queuedSlots.push(randomOrb);
	}
	if (celestialSlots[0] != undefined){ // 큐와 실제 슬롯 동기화
			queuedSlots.splice(0,1);
	}
	for (let i = 0; i < amount; i++) { //생성된 천체 채우기
		celestialSlots.push(queuedSlots[i]);
		drawShapes();
		await sleep(600);
	}
	callback();
}


function isConjuncted() {
	if (celestialSlots[1] == celestialSlots[2] && celestialSlots[1] != undefined) {
		return true;
	} else {
		return false;
	}
}


function useSlot(pressedKey) {
	if (pressedKey == 'q' || pressedKey == 'w' || pressedKey == 'e') {
		const conj = isConjuncted();
		const ableConjCheck = document.getElementsByName("noc");
		const ableConj = [];
		for (let i = 0; i < ableConjCheck.length; i++) { //체크박스 기록
			if (ableConjCheck[i].checked == true) {
				ableConj.push(ableConjCheck[i].value);
			}
		}
		let pressedKeySFX;

		if (conj && !isConjDone && keyList.indexOf(pressedKey) == orbs.indexOf(celestialSlots[1])) { //컨정션 확인
			if (!ableConj.includes(pressedKey)) {
				vibrateSkill(pressedKey);
				const chk = document.querySelector("[for='"+ document.querySelector("[value='"+pressedKey+"']").id +"']" ) // React든 Vue든 썼어야 했는데
				chk.classList.add("yellowHighlight");
				playSound(tickSFX);
				setTimeout(function () {
					chk.classList.remove("yellowHighlight");
				}, 500);
				return;
			}
			celestialSlots.splice(1, 1);
			playSound(voiceLines[3 + keyList.indexOf(pressedKey)])
			pressedKey = 'conj_' + pressedKey;
			isConjDone = true;
		}
		if (keySlots.includes(pressedKey) && !document.getElementById("nolock").checked) { // 중복 확인
			vibrateSkill(pressedKey);
			return;
		}
		if (conj) {
			pressedKeySFX = 'conj'
		} else {
			pressedKeySFX = pressedKey
		}
		playSound(skillSFX[orbs.indexOf(celestialSlots[1])][keyList.indexOf(pressedKeySFX)]);
		keySlots.push(pressedKey);
		celestialSlots.splice(1, 1);
		addScore();
	} else if (pressedKey == 'r') {
		
	}
}

function changeSlot(pressedKey) {
	let tmp = celestialSlots[0];
	celestialSlots[0] = celestialSlots[1]
	celestialSlots[1] = tmp;
	keySlots.push(pressedKey);
	if (isConjuncted()&&!isConjDone){
		playFrqntSound(conjrSFX);
	} else {
		playFrqntSound(rSFX);
	}
}

function addScore() {
	if (!document.getElementById("notimer").checked) {
		score++;
		document.querySelector(".scoreText").innerText = score*10;
	}
}


function restartTimer() {
	const timer = document.querySelector(".timeBar");
	let timeNow = 0;
	if (document.getElementById("notimer").checked) { //타이머 체크
		return;
	}
	timer.classList.remove("running");
	timeLimit = (timeLimit -0.6) * 0.9 + 0.6
	timeNow = timeLimit * 10
	if (interval != undefined) {
		clearInterval(interval);
	}
	interval = setInterval(() => {timeNow--;
		if (timeNow <= 0) {
			 gameOver(); 
			 clearInterval(interval);
			return;
		}
		document.querySelector(".timeText").innerText = Math.floor(timeNow)/10 + ' / ' + Math.floor(timeLimit*10)/10;
		}, 100);
	void timer.offsetWidth;
	timer.classList.add("running");
	timer.style.animationPlayState = "running";
	timer.style.animationDuration = (timeLimit + 's');
}

function resetIcons() {
	resetSkillIcons();
	toggleCoolIcons(false);
}

function resetSkillIcons() {
	const s = document.querySelectorAll(".s img")
	s.forEach((img, i) => {
		img.src = skillImages[i].src;
	});
}

function toggleCoolIcons(bool) {
	const vis = bool ? 'visible' : 'hidden'; 
	const c = document.querySelectorAll(".scool img");
	c.forEach(img=>{
		img.style.visibility = vis
	});
}

function vibrateSkill(skill) {
	document.getElementById(skill).classList.add("vibration");
	document.getElementById(skill + 'x').classList.add("vibration");
	playSound(tickSFX);
	setTimeout(function () {
		document.getElementById(skill).classList.remove("vibration");
		document.getElementById(skill + 'x').classList.remove("vibration");
	}, 300);
}

function updateGame() {
	const conj = isConjuncted();
	const c = document.querySelectorAll(".scool img");
	const s = document.querySelectorAll(".s img")
	const cooltimer = document.getElementById("cooltimer")
	const conjuctedShape = orbs.indexOf(celestialSlots[1]);

	for (let i = 0; i < keySlots.length; i++) { // 사용된 아이콘 x처리
		if (keySlots[i] == 'r') {
			continue;
		} else if (document.getElementById("nolock").checked) {
			toggleCoolIcons(false);
		} else {
			try{document.getElementById(keySlots[i] + "xi").style.visibility = "visible";}
			catch{}
		}
	}

	resetSkillIcons();

	if (conj && !isConjDone) { // 컨정션시 화면 변경
		s[conjuctedShape].src = CskillImages[conjuctedShape].src;
		c[conjuctedShape].style.visibility = "hidden";
		document.querySelector("#conjUI img").src = "./assets/CconjUI.png"
	} else {
		document.querySelector("#conjUI img").src= "./assets/conjUI.png"
	}

	if (!isReadingStar && celestialSlots.length == 1) { // 별읽기
		isReadingStar = true;
		isConjDone = false;
		keySlots = [];
		toggleCoolIcons(true);
		document.querySelector(".timeBar").style.animationPlayState = "paused";
		document.getElementById("reset").style.display = "none";
		clearInterval(interval);
		fillSlot(5, function () {
			toggleCoolIcons(false);
			restartTimer();
			isReadingStar = false;
			document.getElementById("reset").style.display = "inline-block";
		});
	}
	drawShapes();
}

function gameOver() {
	if (document.getElementById("notimer").checked == true) {
		return;
	}
	playSound(deathSFX);
	playSound(voiceLines[getRandomInt(6,9)]);
	duringGame = false;
	document.querySelector(".gameMessage").classList.remove("gameStart");
	document.querySelector(".gameMessage").classList.add("gameOver");
	document.querySelector(".scoreResult").innerText = '점수:' + score*10;
	document.querySelector(".portrait img").src = "./assets/Adina_wat.png";
}

//바우게 = LOL에 나오는 Scuttle. 한국에서 쓰는 아디나의 별명.

const translations = {
  zh: {
    header: "迅捷蟹研究所 (移动触控支持)",
    notimer: "練習模式： 沒有計時",
    nolock: "沒有技能鎖定",
    nosunc: "雙太陽(Q)",
    nomoonc: "雙月亮(W)",
    nostarc: "雙星星(E)",
    volume: "音量",
    nos: "聲音",
    nosfx: "音效",
    start: "開始",
    restart: "重啟",
    reset: "重設",
    summary: "錯誤回報/聯絡我們",
    dcinside: "DC Inside",
    github: "Github"
  },
  en: {
    header: "Scuttle Labatory(w/ mobile touch support)",
    notimer: "Practice Mode: No Timer",
    nolock: "No Skill Lock",
    nosunc: "Sun x 2(Q)",
    nomoonc: "Moon x 2(W)",
    nostarc: "Star x 2(E)",
    volume: "Volume",
    nos: "Voice",
    nosfx: "SFX",
    start: "Start",
    restart: "Restart",
    reset: "Reset",
    summary: "Bug Report/Contact Us",
    dcinside: "DC Inside",
    github: "Github"
  },
  kr: {
    header: "바우게 연구소(이제 모바일 터치 지원함)",
    notimer: "연습 모드: 타이머X",
    nolock: "스킬잠김X",
    nosunc: "해컨(Q)",
    nomoonc: "달컨(W)",
    nostarc: "별컨(E)",
    volume: "볼륨",
    nos: "보이스",
    nosfx: "효과음",
    start: "시작",
    restart: "다시하기",
    reset: "리셋",
    summary: "버그신고/문의",
    dcinside: "갤",
    github: "깃헙",
  }
};

function translatePage(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = translations[lang][key];
  });
}
