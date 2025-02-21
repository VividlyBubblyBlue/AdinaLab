function astralTrine() {

  const astralTrineElement = document.createElement('div');

  astralTrineElement.innerText = 'W';
  astralTrineElement.classList.add('astralTrine');

  const spritesElement = document.querySelector('.sprites');
  spritesElement.appendChild(astralTrineElement);
  
  sleep(1000).then(() => {
    astralTrineElement.remove();
  });
}