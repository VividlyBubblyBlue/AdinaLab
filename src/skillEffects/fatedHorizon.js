function fatedHorizon() {

    const fatedHorizonElement = document.createElement('div');
  
    if (isConjuncted == false) 
      fatedHorizonElement.innerText = 'Econj';
    else
      if  (celestialSlots[1] == 'sun') {
        fatedHorizonElement.innerText = 'Esun';}
      else if (celestialSlots[1] == 'moon') {
        fatedHorizonElement.innerText = 'Emoon'; }
      else if (celestialSlots[1] == 'star') {
        fatedHorizonElement.innerText = 'Estar';
    }
    fatedHorizonElement.classList.add('fatedHorizon');
  
    const spritesElement = document.querySelector('.sprites');
    spritesElement.appendChild(fatedHorizonElement);
  
    sleep(1000).then(() => {
      fatedHorizonElement.remove();
    });
  }