const toggleGame = () => {
  const game = document.getElementById('game');
  game.addEventListener('click', () => {
    document.body.classList.toggle('toggle');
  });
};

const turretMove = () => {
  const main = document.getElementById('main');
  const turret = document.getElementById('turret');

  const mapSectorTurret = {
    game: 'left',
    tanks: 'center',
    power: 'right'
  };
  const sectorSelectorsById = Object.keys(mapSectorTurret).map(s => `#${s}`);

  let turretDirection;

  main.addEventListener('mousemove', e => {
    const section = e.target.closest(sectorSelectorsById);
    if (!section) {
      return;
    }

    const newTurretDirection = mapSectorTurret[section.id];
    if (turretDirection === newTurretDirection) {
      return;
    }

    turretDirection = newTurretDirection;
    turret.dataset.direction = turretDirection;
  });
};

const tankMove = ({ id, velocity = 0.5 }) => {
  const tank = document.getElementById(id);
  if (!tank) {
    return;
  }

  const isInWindowVertically = (objY, objHeight) => {
    return objY + objHeight > 0 && objY < window.innerHeight;
  };

  const getTankParam = param => tank.getBoundingClientRect()[param];
  const getTankY = () => getTankParam('y');

  const tankHeight = getTankParam('height');
  let firstX = getTankParam('x') - getTankParam('width');
  let lastY = getTankY();

  document.querySelector('.layout_item__game').addEventListener('scroll', () => {
    const tankY = getTankY();

    if (isInWindowVertically(tankY, tankHeight)) {
      const dy = tankY - lastY;
      const dx = (-dy * velocity * window.innerWidth) / window.innerHeight;
      firstX += dx;

      tank.style.transform = `translate3d(${firstX}px, 0, 0)`;
    }
    lastY = tankY;
  });
};

toggleGame();
turretMove();
tankMove({ id: 'tank2' });
