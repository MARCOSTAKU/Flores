// Variables globales
let flowers = [];
let particles = [];
let particleAnimation;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    createFlowers(); // Solo crear los datos, no renderizar
    setupMessageButton();
    createParticleSystem();
    setupMagicCursor();
});

// Configurar el botón del mensaje
function setupMessageButton() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.addEventListener('click', function() {
            // Sonido del botón
            playButtonSound();
            
            // Efecto de dispersión del botón
            messageContainer.style.animation = 'buttonExplode 1.2s ease-in-out forwards';
            
            // Crear efecto de fade to black
            const fadeOverlay = document.createElement('div');
            fadeOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0);
                z-index: 15;
                pointer-events: none;
                transition: background 0.8s ease-in-out;
            `;
            document.body.appendChild(fadeOverlay);
            
            setTimeout(() => {
                fadeOverlay.style.background = 'rgba(0, 0, 0, 0.3)';
            }, 200);
            
            // Intensificar partículas
            setTimeout(() => {
                intensifyParticles();
            }, 600);
            
            // Crear rayos de sol
            setTimeout(() => {
                createSunRays();
            }, 800);
            
            // Renderizar un girasol grande primero, luego las flores pequeñas
            setTimeout(() => {
                createBigSunflower();
                setTimeout(() => {
                    renderFlowers();
                }, 1500); // Las flores pequeñas aparecen 1.5s después del grande
            }, 1000);
            
            // Remover el elemento después de la animación
            setTimeout(() => {
                messageContainer.remove();
                // Quitar el overlay gradualmente
                fadeOverlay.style.background = 'rgba(0, 0, 0, 0)';
                setTimeout(() => {
                    if (fadeOverlay.parentNode) {
                        fadeOverlay.parentNode.removeChild(fadeOverlay);
                    }
                }, 1000);
            }, 1200);
        });
        
        // Cambiar cursor para indicar que es clickeable
        messageContainer.style.cursor = 'pointer';
        messageContainer.style.userSelect = 'none';
        
        // Añadir efecto hover mejorado
        messageContainer.addEventListener('mouseenter', function() {
            messageContainer.style.transform = 'translate(-50%, -50%) scale(1.05)';
            messageContainer.style.boxShadow = '0 15px 40px rgba(255, 235, 59, 0.4)';
            
            // Efecto de brillo
            const glow = document.createElement('div');
            glow.style.cssText = `
                position: absolute;
                top: -5px;
                left: -5px;
                right: -5px;
                bottom: -5px;
                background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.3), transparent);
                border-radius: 25px;
                z-index: -1;
                animation: buttonGlow 2s ease-in-out infinite;
            `;
            messageContainer.appendChild(glow);
        });
        
        messageContainer.addEventListener('mouseleave', function() {
            messageContainer.style.transform = 'translate(-50%, -50%) scale(1)';
            messageContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            
            // Remover efecto de brillo
            const glow = messageContainer.querySelector('div');
            if (glow && glow.style.animation.includes('buttonGlow')) {
                glow.remove();
            }
        });
    }
}

// Crear datos de flores - Girasoles más separados
function createFlowers() {
    flowers = [];
    const positions = []; // Para evitar solapamientos
    
    for (let i = 0; i < 12; i++) {
        let attempts = 0;
        let validPosition = false;
        let x, y;
        
        // Intentar encontrar una posición que no se solape con otras
        while (!validPosition && attempts < 50) {
            // Generar posiciones alrededor del centro (donde estará el mensaje)
            const angle = Math.random() * 2 * Math.PI; // Ángulo aleatorio
            const radius = Math.random() * 25 + 20; // Radio entre 20% y 45% del centro (más alejado del girasol grande)
            
            x = 50 + Math.cos(angle) * radius; // Centro en 50% + offset
            y = 50 + Math.sin(angle) * radius; // Centro en 50% + offset
            
            // Asegurar que estén dentro de los límites
            x = Math.max(10, Math.min(90, x));
            y = Math.max(20, Math.min(80, y));
            
            // Verificar que no esté muy cerca del centro (donde está el girasol grande)
            const distanceFromCenter = Math.sqrt(Math.pow(x - 50, 2) + Math.pow(y - 50, 2));
            if (distanceFromCenter < 18) { // Mantener distancia del girasol grande
                validPosition = false;
                attempts++;
                continue;
            }
            
            validPosition = true;
            // Verificar distancia mínima con otras flores
            for (let pos of positions) {
                const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (distance < 15) { // Distancia mínima de 15% para área más concentrada
                    validPosition = false;
                    break;
                }
            }
            attempts++;
        }
        
        if (validPosition) {
            positions.push({x, y});
            flowers.push({
                id: i,
                x: x,
                y: y,
                size: Math.random() * 0.3 + 0.7, // Tamaño más consistente
                rotation: Math.random() * 360,
                animation_delay: Math.random() * 4,
                petals: Math.floor(Math.random() * 9) + 13 // 13-21 pétalos como girasoles reales
            });
        }
    }
}

// Renderizar todas las flores con animación de caída
function renderFlowers() {
    const garden = document.getElementById('flowerGarden');
    garden.innerHTML = '';
    
    let completedAnimations = 0;
    const totalFlowers = flowers.length;
    
    flowers.forEach((flower, index) => {
        const flowerElement = createFlowerElement(flower, index);
        garden.appendChild(flowerElement);
        
        console.log(`Flower ${index} created at position: ${flower.x}%, ${flower.y}%`);
        
        // Configurar variables CSS para la animación
        flowerElement.style.setProperty('--flower-size', flower.size);
        flowerElement.style.setProperty('--flower-rotation', flower.rotation + 'deg');
        flowerElement.style.setProperty('--flower-x', flower.x + '%');
        flowerElement.style.setProperty('--flower-y', flower.y + '%');
        
        // Posicionar inicialmente muy arriba de la pantalla para animación de caída
        flowerElement.style.position = 'absolute';
        flowerElement.style.left = flower.x + '%';
        flowerElement.style.top = flower.y + '%'; // Posición final
        flowerElement.style.transform = `translate(-50%, -150vh) scale(0.3) rotate(0deg)`; // Empezar muy arriba
        flowerElement.style.opacity = '0';
        flowerElement.style.visibility = 'visible';
        
        // Añadir animación de caída con delay escalonado
        setTimeout(() => {
            flowerElement.classList.add('blooming');
            console.log(`Flower ${index} animation started`);
            
            // Sonido sutil para cada flor
            setTimeout(() => {
                playFlowerSound();
            }, 1000);
            
            // Añadir efecto de rebote después de que termine la caída
            setTimeout(() => {
                flowerElement.classList.add('landed');
                setTimeout(() => {
                    // NO remover la clase 'landed' para mantener las flores visibles
                    // flowerElement.classList.remove('landed');
                    
                    // Contar animaciones completadas
                    completedAnimations++;
                    
                    // Si todas las flores han terminado, mostrar mensaje final
                    if (completedAnimations === totalFlowers) {
                        showFinalMessage();
                    }
                }, 800);
            }, 3000); // Duración de la animación de caída (3s)
            
        }, index * 150); // 150ms de delay entre cada girasol para efecto más rápido
    });
}

// Crear elemento de flor individual - Girasol SVG realista
function createFlowerElement(flowerData, index) {
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.style.left = `${flowerData.x}%`;
    flower.style.top = `${flowerData.y}%`;
    // No establecer transform inicial - se manejará con CSS variables
    flower.style.animationDelay = `${flowerData.animation_delay}s`;
    
    // Crear SVG del girasol
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '150');
    svg.setAttribute('height', '150');
    svg.setAttribute('viewBox', '0 0 150 150');
    svg.style.filter = 'drop-shadow(2px 4px 8px rgba(0, 0, 0, 0.3))';
    
    // Crear definiciones para gradientes y patrones
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Gradiente para pétalos
    const petalGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    petalGradient.setAttribute('id', `petalGrad-${index}`);
    petalGradient.setAttribute('x1', '0%');
    petalGradient.setAttribute('y1', '0%');
    petalGradient.setAttribute('x2', '100%');
    petalGradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#FF6B8A');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#FF4D6B');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#C2185B');
    
    petalGradient.appendChild(stop1);
    petalGradient.appendChild(stop2);
    petalGradient.appendChild(stop3);
    
    // Gradiente radial para el centro
    const centerGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    centerGradient.setAttribute('id', `centerGrad-${index}`);
    centerGradient.setAttribute('cx', '30%');
    centerGradient.setAttribute('cy', '30%');
    centerGradient.setAttribute('r', '70%');
    
    const centerStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    centerStop1.setAttribute('offset', '0%');
    centerStop1.setAttribute('stop-color', '#5D0018');
    
    const centerStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    centerStop2.setAttribute('offset', '60%');
    centerStop2.setAttribute('stop-color', '#3E0010');
    
    const centerStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    centerStop3.setAttribute('offset', '100%');
    centerStop3.setAttribute('stop-color', '#2A0008');
    
    centerGradient.appendChild(centerStop1);
    centerGradient.appendChild(centerStop2);
    centerGradient.appendChild(centerStop3);
    
    // Patrón de semillas
    const seedPattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    seedPattern.setAttribute('id', `seedPattern-${index}`);
    seedPattern.setAttribute('x', '0');
    seedPattern.setAttribute('y', '0');
    seedPattern.setAttribute('width', '8');
    seedPattern.setAttribute('height', '8');
    seedPattern.setAttribute('patternUnits', 'userSpaceOnUse');
    
    // Crear pequeños círculos para las semillas
    for (let s = 0; s < 4; s++) {
        const seed = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            seed.setAttribute('cx', s % 2 === 0 ? '2' : '6');
            seed.setAttribute('cy', s < 2 ? '2' : '6');
            seed.setAttribute('r', '0.8');
            seed.setAttribute('fill', '#2E0F1A');
            seed.setAttribute('opacity', '0.6');
        seedPattern.appendChild(seed);
    }
    
    defs.appendChild(petalGradient);
    defs.appendChild(centerGradient);
    defs.appendChild(seedPattern);
    svg.appendChild(defs);
    
    // Crear grupo para el girasol
    const sunflowerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    sunflowerGroup.setAttribute('transform', 'translate(75, 75)');
    
    // Crear pétalos en forma de lágrima
    for (let i = 0; i < flowerData.petals; i++) {
        const angle = (360 / flowerData.petals) * i;
        const petal = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Forma de lágrima realista para el pétalo
        const petalPath = `M 0,-45 C -8,-40 -12,-30 -8,-20 C -4,-10 4,-10 8,-20 C 12,-30 8,-40 0,-45 Z`;
        
        petal.setAttribute('d', petalPath);
        petal.setAttribute('fill', `url(#petalGrad-${index})`);
        petal.setAttribute('stroke', '#FF8C00');
        petal.setAttribute('stroke-width', '0.5');
        petal.setAttribute('transform', `rotate(${angle})`);
        petal.setAttribute('opacity', '0.9');
        
        // Añadir variación sutil al tamaño
        const scale = 0.9 + Math.random() * 0.2;
        petal.setAttribute('transform', `rotate(${angle}) scale(${scale})`);
        
        sunflowerGroup.appendChild(petal);
    }
    
    // Crear centro del girasol
    const center = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    center.setAttribute('cx', '0');
    center.setAttribute('cy', '0');
    center.setAttribute('r', '18');
    center.setAttribute('fill', `url(#centerGrad-${index})`);
    center.setAttribute('stroke', '#5D4037');
    center.setAttribute('stroke-width', '1');
    
    sunflowerGroup.appendChild(center);
    
    // Añadir patrón de semillas sobre el centro
    const seedOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    seedOverlay.setAttribute('cx', '0');
    seedOverlay.setAttribute('cy', '0');
    seedOverlay.setAttribute('r', '16');
    seedOverlay.setAttribute('fill', `url(#seedPattern-${index})`);
    seedOverlay.setAttribute('opacity', '0.8');
    
    sunflowerGroup.appendChild(seedOverlay);
    
    // Añadir textura adicional de semillas con espiral
    for (let s = 0; s < 30; s++) {
        const spiralAngle = s * 137.5; // Ángulo dorado para espiral natural
        const spiralRadius = Math.sqrt(s) * 1.5;
        
        if (spiralRadius < 15) {
            const seed = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            const x = Math.cos(spiralAngle * Math.PI / 180) * spiralRadius;
            const y = Math.sin(spiralAngle * Math.PI / 180) * spiralRadius;
            
            seed.setAttribute('cx', x);
            seed.setAttribute('cy', y);
            seed.setAttribute('r', '0.8');
            seed.setAttribute('fill', '#1A0F06');
            seed.setAttribute('opacity', '0.7');
            
            sunflowerGroup.appendChild(seed);
        }
    }
    
    svg.appendChild(sunflowerGroup);
    
    // Crear tallo SVG (más cerca de la flor)
    const stem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    stem.setAttribute('width', '10');
    stem.setAttribute('height', '50'); // Reducido de 80 a 50
    stem.style.position = 'absolute';
    stem.style.bottom = '-30px'; // Cambiado de -80px a -30px para estar más cerca
    stem.style.left = '50%';
    stem.style.transform = 'translateX(-50%)';
    stem.style.zIndex = '-1';
    
    const stemRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    stemRect.setAttribute('x', '2');
    stemRect.setAttribute('y', '0');
    stemRect.setAttribute('width', '6');
    stemRect.setAttribute('height', '50'); // Reducido también aquí
    stemRect.setAttribute('fill', 'url(#stemGrad)');
    stemRect.setAttribute('rx', '3');
    
    // Gradiente para el tallo
    const stemDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const stemGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    stemGradient.setAttribute('id', 'stemGrad');
    stemGradient.setAttribute('x1', '0%');
    stemGradient.setAttribute('y1', '0%');
    stemGradient.setAttribute('x2', '100%');
    stemGradient.setAttribute('y2', '0%');
    
    const stemStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stemStop1.setAttribute('offset', '0%');
    stemStop1.setAttribute('stop-color', '#2E7D32');
    
    const stemStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stemStop2.setAttribute('offset', '50%');
    stemStop2.setAttribute('stop-color', '#4CAF50');
    
    const stemStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stemStop3.setAttribute('offset', '100%');
    stemStop3.setAttribute('stop-color', '#1B5E20');
    
    stemGradient.appendChild(stemStop1);
    stemGradient.appendChild(stemStop2);
    stemGradient.appendChild(stemStop3);
    stemDefs.appendChild(stemGradient);
    stem.appendChild(stemDefs);
    stem.appendChild(stemRect);
    
    // Añadir elementos al contenedor de la flor
    flower.appendChild(svg);
    flower.appendChild(stem);
    
    // Añadir interactividad
    flower.addEventListener('click', () => onFlowerClick(flower));
    flower.addEventListener('mouseenter', () => onFlowerHover(flower));
    flower.addEventListener('mouseleave', () => onFlowerLeave(flower));
    
    return flower;
}

// Crear girasol grande especial
function createBigSunflower() {
    const garden = document.getElementById('flowerGarden');
    
    // Crear el girasol grande
    const bigFlower = {
        id: 'big-sunflower',
        x: 50, // Centro de la pantalla
        y: 50,
        size: 3, // 3 veces más grande
        rotation: 0,
        petals: 20 // Más pétalos para que se vea más impresionante
    };
    
    const bigFlowerElement = createFlowerElement(bigFlower, 0);
    bigFlowerElement.id = 'big-sunflower';
    bigFlowerElement.classList.add('big-sunflower');
    
    // Posicionarlo en el centro y empezar muy pequeño
    bigFlowerElement.style.position = 'absolute';
    bigFlowerElement.style.left = '50%';
    bigFlowerElement.style.top = '50%';
    bigFlowerElement.style.transform = 'translate(-50%, -50%) scale(0) rotate(0deg)';
    bigFlowerElement.style.opacity = '0';
    bigFlowerElement.style.zIndex = '10';
    
    garden.appendChild(bigFlowerElement);
    
    // Animación de aparición dramática
    setTimeout(() => {
        bigFlowerElement.style.transition = 'all 2s cubic-bezier(0.34, 1.56, 0.64, 1)';
        bigFlowerElement.style.transform = 'translate(-50%, -50%) scale(1) rotate(360deg)';
        bigFlowerElement.style.opacity = '1';
        
        // Sonido especial para el girasol grande
        playFlowerSound();
        
        // Efecto de brillo
        setTimeout(() => {
            bigFlowerElement.style.filter = 'drop-shadow(0 0 20px #FF7AA3)';
        }, 1000);
    }, 100);
}

// Crear girasol GIGANTE cuando se toca el mensaje final
function createGigaSunflower() {
    const garden = document.getElementById('flowerGarden');
    
    // ELIMINAR todos los girasoles existentes
    const existingFlowers = garden.querySelectorAll('.flower');
    existingFlowers.forEach(flower => {
        flower.style.transition = 'all 1s ease-out';
        flower.style.opacity = '0';
        flower.style.transform = 'scale(0) rotate(360deg)';
        setTimeout(() => {
            if (flower.parentNode) {
                flower.parentNode.removeChild(flower);
            }
        }, 1000);
    });
    
    // Crear el girasol MEGA GIGANTE
    const gigaFlower = {
        id: 'giga-sunflower',
        x: 50, // Centro de la pantalla
        y: 50,
        size: 20, // 20 veces más grande - ABSOLUTAMENTE COLOSAL
        rotation: 0,
        petals: 35 // Aún más pétalos para que se vea espectacular
    };
    
    const gigaFlowerElement = createFlowerElement(gigaFlower, 0);
    gigaFlowerElement.id = 'giga-sunflower';
    gigaFlowerElement.classList.add('giga-sunflower');
    
    // Posicionarlo en el centro y empezar invisible
    gigaFlowerElement.style.position = 'fixed';
    gigaFlowerElement.style.left = '50%';
    gigaFlowerElement.style.top = '50%';
    gigaFlowerElement.style.transform = 'translate(-50%, -50%) scale(0) rotate(0deg)';
    gigaFlowerElement.style.opacity = '0';
    gigaFlowerElement.style.zIndex = '20';
    
    // Ocultar el mensaje final temporalmente
    const finalMessage = document.getElementById('finalMessage');
    if (finalMessage) {
        finalMessage.style.transition = 'all 0.5s ease';
        finalMessage.style.opacity = '0';
        finalMessage.style.transform = 'translate(-50%, -50%) scale(0)';
    }
    
    garden.appendChild(gigaFlowerElement);
    
    // Animación de aparición ÉPICA - esperar a que desaparezcan los otros
    setTimeout(() => {
        // Crear efecto de pulso de fondo
        const pulseOverlay = document.createElement('div');
        pulseOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle at center, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
            z-index: 19;
            pointer-events: none;
            opacity: 0;
            animation: gigaPulse 6s ease-in-out;
        `;
        document.body.appendChild(pulseOverlay);
        
        // Sonido especial más dramático
        playFinalSound();
        
        gigaFlowerElement.style.transition = 'all 4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        gigaFlowerElement.style.transform = 'translate(-50%, -50%) scale(1) rotate(1080deg)'; // Triple rotación
        gigaFlowerElement.style.opacity = '1';
        
        // Efecto de brillo intenso
        setTimeout(() => {
            gigaFlowerElement.style.filter = 'drop-shadow(0 0 120px #FF7AA3) drop-shadow(0 0 240px rgba(255, 105, 180, 0.8)) drop-shadow(0 0 360px rgba(255, 105, 180, 0.5))';
            
            // Eliminar el overlay de pulso
            setTimeout(() => {
                if (pulseOverlay.parentNode) {
                    pulseOverlay.parentNode.removeChild(pulseOverlay);
                }
            }, 2000);
            
            // Mostrar el mensaje final encima del girasol gigante después de un momento
            setTimeout(() => {
                if (finalMessage) {
                    finalMessage.style.zIndex = '25';
                    finalMessage.style.opacity = '1';
                    finalMessage.style.transform = 'translate(-50%, -50%) scale(1)';
                    finalMessage.style.pointerEvents = 'none'; // Desactivar más clicks
                }
            }, 1500);
        }, 2000);
    }, 1200); // Esperar 1.2s a que desaparezcan los otros girasoles
}

// Manejar click en flor
function onFlowerClick(flowerElement) {
    // Añadir clase temporal para animación especial
    flowerElement.classList.add('clicked');
    
    // Sonido de click en flor
    playSound(600, 0.3, 'sine', 0.03);
    
    // Crear pétalos que caen de esta flor específica
    createFlowerPetals(flowerElement);
    
    setTimeout(() => {
        flowerElement.classList.remove('clicked');
    }, 1000);
}

// Manejar hover en flor
function onFlowerHover(flowerElement) {
    flowerElement.style.filter = 'brightness(1.3) drop-shadow(0 0 15px #ffeb3b)';
    flowerElement.style.transform = flowerElement.style.transform + ' scale(1.1)';
    
    // Efecto de brillo alrededor de la flor
    const glowRing = document.createElement('div');
    glowRing.className = 'flower-glow-ring';
    glowRing.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 200px;
        height: 200px;
        border: 2px solid rgba(255, 215, 0, 0.6);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: ringPulse 2s ease-in-out infinite;
        pointer-events: none;
        z-index: -1;
    `;
    flowerElement.appendChild(glowRing);
}

// Manejar salida del hover
function onFlowerLeave(flowerElement) {
    flowerElement.style.filter = '';
    flowerElement.style.transform = flowerElement.style.transform.replace(' scale(1.1)', '');
    
    // Remover efecto de brillo
    const glowRing = flowerElement.querySelector('.flower-glow-ring');
    if (glowRing) {
        glowRing.remove();
    }
}

// Crear pétalos que caen de una flor específica
function createFlowerPetals(flowerElement) {
    const rect = flowerElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
        const petal = document.createElement('div');
        petal.style.cssText = `
            position: fixed;
            width: 8px;
            height: 12px;
            background: linear-gradient(45deg, #FF9FC1, #FF6B9C);
            border-radius: 50% 0 50% 0;
            left: ${centerX}px;
            top: ${centerY}px;
            pointer-events: none;
            z-index: 30;
            animation: individualPetalFall 2s ease-out forwards;
            transform: rotate(${Math.random() * 360}deg);
        `;
        
        const angle = (Math.PI * 2 * i) / 6 + Math.random() * 0.5;
        const velocity = Math.random() * 50 + 30;
        
        petal.style.setProperty('--end-x', `${Math.cos(angle) * velocity}px`);
        petal.style.setProperty('--end-y', `${Math.sin(angle) * velocity + 100}px`);
        
        document.body.appendChild(petal);
        
        // Remover pétalo después de la animación
        setTimeout(() => {
            if (petal.parentNode) {
                petal.parentNode.removeChild(petal);
            }
        }, 2000);
    }
}

// Añadir estilos CSS dinámicos para la animación de click
const style = document.createElement('style');
style.textContent = `
    .flower.clicked {
        animation: flowerPulse 1s ease-in-out;
    }
    
    @keyframes flowerPulse {
        0%, 100% { transform: scale(var(--flower-scale, 1)) rotate(var(--flower-rotation, 0deg)); }
        50% { transform: scale(calc(var(--flower-scale, 1) * 1.3)) rotate(calc(var(--flower-rotation, 0deg) + 10deg)); }
    }
`;
document.head.appendChild(style);

// Mostrar el mensaje final después de que todas las flores hayan caído
function showFinalMessage() {
    setTimeout(() => {
        // Reproducir sonido del mensaje final
        playFinalSound();
        
        const finalMessage = document.getElementById('finalMessage');
        if (finalMessage) {
            finalMessage.style.display = 'block';
            
            // Efecto de aparición dramática
            finalMessage.style.transform = 'translate(-50%, -50%) scale(0.3) translateY(100px)';
            finalMessage.style.opacity = '0';
            
            setTimeout(() => {
                finalMessage.style.opacity = '1';
                finalMessage.style.transform = 'translate(-50%, -50%) scale(1) translateY(0)';
                
                // Crear efecto de confeti de pétalos
                createPetalConfetti();
                
                // Hacer el mensaje final clickeable para crear girasol gigante
                finalMessage.style.cursor = 'pointer';
                finalMessage.addEventListener('click', function() {
                    createGigaSunflower();
                });
                
            }, 100);
        }
    }, 1500); // Esperar 1.5 segundos después de que termine la última animación
}

// Efecto de confeti de pétalos
function createPetalConfetti() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 25;
    `;
    document.body.appendChild(container);
    
    // Crear pétalos que caen
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const petal = document.createElement('div');
            petal.style.cssText = `
                position: absolute;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 15 + 10}px;
                    background: linear-gradient(45deg, #FF9FC1, #FF6B9C);
                border-radius: 50% 0 50% 0;
                top: -20px;
                left: ${Math.random() * 100}vw;
                animation: petalFall ${Math.random() * 3 + 3}s ease-in forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            container.appendChild(petal);
            
            // Remover pétalo después de la animación
            setTimeout(() => {
                if (petal.parentNode) {
                    petal.parentNode.removeChild(petal);
                }
            }, 6000);
        }, i * 100);
    }
    
    // Remover contenedor después de un tiempo
    setTimeout(() => {
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    }, 8000);
}

// Función para limpiar la página y preparar para nueva animación
function resetPage() {
    const garden = document.getElementById('flowerGarden');
    const finalMessage = document.getElementById('finalMessage');
    
    if (garden) garden.innerHTML = '';
    if (finalMessage) {
        finalMessage.style.opacity = '0';
        finalMessage.style.display = 'none';
    }
}

// Sistema de partículas de polen
function createParticleSystem() {
    const particleContainer = document.createElement('div');
    particleContainer.id = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.appendChild(particleContainer);
    
    // Crear partículas iniciales sutiles
    for (let i = 0; i < 15; i++) {
        createParticle(particleContainer, false);
    }
    
    startParticleAnimation();
}

function createParticle(container, intense = false) {
    const particle = document.createElement('div');
    const size = Math.random() * (intense ? 4 : 2) + 1;
    const opacity = Math.random() * 0.6 + 0.2;
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, #FF9FC1 0%, #FF6B9C 50%, transparent 100%);
        border-radius: 50%;
        opacity: ${opacity};
        pointer-events: none;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
        box-shadow: 0 0 ${size * 2}px #FF9FC1;
    `;
    
    container.appendChild(particle);
    
    // Remover partícula después de la animación
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 30000);
    
    return particle;
}

function intensifyParticles() {
    const container = document.getElementById('particle-container');
    if (container) {
        // Crear más partículas intensas
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                createParticle(container, true);
            }, i * 100);
        }
    }
}

function startParticleAnimation() {
    const container = document.getElementById('particle-container');
    if (container) {
        setInterval(() => {
            createParticle(container, false);
        }, 2000);
    }
}

// Efectos de sonido (usando Web Audio API)
function playSound(frequency, duration, type = 'sine', volume = 0.1) {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playButtonSound() {
    playSound(800, 0.2, 'sine', 0.05);
    setTimeout(() => playSound(1000, 0.3, 'sine', 0.03), 100);
}

function playFlowerSound() {
    playSound(400, 0.5, 'sine', 0.02);
}

function playFinalSound() {
    // Secuencia de notas para el mensaje final
    const notes = [523, 659, 784, 1047]; // Do, Mi, Sol, Do octava
    notes.forEach((note, index) => {
        setTimeout(() => {
            playSound(note, 0.4, 'sine', 0.04);
        }, index * 150);
    });
}

// Efecto de rayos de sol
function createSunRays() {
    const raysContainer = document.createElement('div');
    raysContainer.id = 'sun-rays';
    raysContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 2;
        opacity: 0;
        transition: opacity 2s ease-in-out;
    `;
    
    // Crear múltiples rayos
    for (let i = 0; i < 8; i++) {
        const ray = document.createElement('div');
        ray.style.cssText = `
            position: absolute;
            top: -50vh;
            left: ${20 + i * 10}vw;
            height: 200vh;
            background: linear-gradient(to bottom, 
                transparent 0%, 
                rgba(255, 105, 180, 0.18) 20%, 
                rgba(255, 105, 180, 0.08) 50%, 
                transparent 100%);
            transform: rotate(${-20 + i * 5}deg);
            animation: sunRayAnimation ${3 + Math.random() * 2}s ease-in-out infinite alternate;
        `;
        raysContainer.appendChild(ray);
    }
    
    document.body.appendChild(raysContainer);
    
    // Mostrar rayos gradualmente
    setTimeout(() => {
        raysContainer.style.opacity = '1';
    }, 1000);
    
    return raysContainer;
}

// Cursor mágico que sigue el mouse
function setupMagicCursor() {
    const cursor = document.createElement('div');
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, rgba(255, 105, 180, 0.8) 0%, transparent 70%);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.1s ease;
        mix-blend-mode: screen;
    `;
    
    document.body.appendChild(cursor);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
    });
    
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    // Animación suave del cursor
    function animateCursor() {
        const speed = 0.15;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.left = cursorX - 10 + 'px';
        cursor.style.top = cursorY - 10 + 'px';
        
        requestAnimationFrame(animateCursor);
    }
    
    animateCursor();
    
    // Efectos especiales en hover
    document.addEventListener('mouseenter', (e) => {
        if (e.target.classList.contains('flower') || 
            e.target.closest('.message-container') || 
            e.target.closest('.final-message')) {
            cursor.style.transform = 'scale(2)';
            cursor.style.background = 'radial-gradient(circle, rgba(255, 105, 180, 0.95) 0%, transparent 70%)';
        }
    }, true);
    
    document.addEventListener('mouseleave', (e) => {
        if (e.target.classList.contains('flower') || 
            e.target.closest('.message-container') || 
            e.target.closest('.final-message')) {
            cursor.style.transform = 'scale(1)';
            cursor.style.background = 'radial-gradient(circle, rgba(255, 105, 180, 0.8) 0%, transparent 70%)';
        }
    }, true);
}

// Efecto de estelas de partículas al mover el cursor
function createTrailParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(255, 105, 180, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        left: ${x}px;
        top: ${y}px;
        animation: trailFade 1s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 1000);
}

// Agregar animación de estela
const trailStyle = document.createElement('style');
trailStyle.textContent = `
    @keyframes trailFade {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }
`;
document.head.appendChild(trailStyle);

// Crear estela en movimiento
let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrailTime > 100) { // Limitar frecuencia
        createTrailParticle(e.clientX, e.clientY);
        lastTrailTime = now;
    }
});

