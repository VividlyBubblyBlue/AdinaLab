function luminary() {
  // 1. 엘리먼트 생성
  const luminaryElement = document.createElement('div');
  // 2. 엘리먼트 속성 변경
  luminaryElement.innerText = 'Q';
  luminaryElement.classList.add('luminary');

  // 3. 엘리먼트를 화면에 추가
  // 어디에 추가할지를 가지고 온다
  const spritesElement = document.querySelector('.sprites');
  spritesElement.appendChild(luminaryElement);

  luminaryElement.addEventListener('animationend', () => {
    luminaryElement.remove();
  });
}