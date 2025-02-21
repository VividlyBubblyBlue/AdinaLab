function astralTrine() {

  const astralTrineElement = document.createElement('div');

  if (isConjuncted == false) 
    astralTrineElement.innerText = 'Wconj';
  else
    if  (celestialSlots[1] == 'sun') {
      astralTrineElement.innerText = 'Wsun';}
    else if (celestialSlots[1] == 'moon') {
      astralTrineElement.innerText = 'Wmoon'; }
    else if (celestialSlots[1] == 'star') {
      astralTrineElement.innerText = 'Wstar';
  }
  astralTrineElement.classList.add('astralTrine');

  const spritesElement = document.querySelector('.sprites');
  spritesElement.appendChild(astralTrineElement);
  
  sleep(1000).then(() => {
    astralTrineElement.remove();
  });
}