function fatedHorizon() {

    const fatedHorizonElement = document.createElement('div');
  
    fatedHorizonElement.innerText = 'E';
    fatedHorizonElement.classList.add('fatedHorizon');
  
    const spritesElement = document.querySelector('.sprites');
    spritesElement.appendChild(fatedHorizonElement);
  
    sleep(1000).then(() => {
      fatedHorizonElement.remove();
    });
  }