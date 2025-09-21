// Variables globales
let flowers = [];

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    createFlowers(); // Solo crear los datos, no renderizar
    setupMessageButton();
});

// Configurar el botón del mensaje
function setupMessageButton() {
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.addEventListener('click', function() {
            // Añadir animación de salida
            messageContainer.style.animation = 'fadeOut 0.8s ease-in-out forwards';
            
            // Renderizar las flores después de que empiece la animación del mensaje
            setTimeout(() => {
                renderFlowers();
            }, 200);
            
            // Remover el elemento después de la animación
            setTimeout(() => {
                messageContainer.remove();
            }, 800);
        });
        
        // Cambiar cursor para indicar que es clickeable
        messageContainer.style.cursor = 'pointer';
        messageContainer.style.userSelect = 'none';
        
        // Añadir efecto hover
        messageContainer.addEventListener('mouseenter', function() {
            messageContainer.style.transform = 'translate(-50%, -50%) scale(1.05)';
        });
        
        messageContainer.addEventListener('mouseleave', function() {
            messageContainer.style.transform = 'translate(-50%, -50%) scale(1)';
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
            x = Math.random() * 80 + 10; // 10% margen en cada lado
            y = Math.random() * 70 + 15; // 15% margen arriba y abajo
            
            validPosition = true;
            // Verificar distancia mínima con otras flores
            for (let pos of positions) {
                const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
                if (distance < 20) { // Distancia mínima de 20%
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
        
        // Posicionar inicialmente fuera de la pantalla (arriba)
        flowerElement.style.transform = `translateY(-100vh) scale(${flower.size}) rotate(${flower.rotation}deg)`;
        flowerElement.style.opacity = '0';
        
        // Añadir animación de caída con delay escalonado
        setTimeout(() => {
            flowerElement.classList.add('blooming');
            
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
            }, 2500); // Duración de la animación de caída
            
        }, index * 300); // 300ms de delay entre cada girasol
    });
}

// Crear elemento de flor individual - Girasol SVG realista
function createFlowerElement(flowerData, index) {
    const flower = document.createElement('div');
    flower.className = 'flower';
    flower.style.left = `${flowerData.x}%`;
    flower.style.top = `${flowerData.y}%`;
    flower.style.transform = `scale(${flowerData.size}) rotate(${flowerData.rotation}deg)`;
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
    stop1.setAttribute('stop-color', '#FFD700');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#FFA500');
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#FF8C00');
    
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
    centerStop1.setAttribute('stop-color', '#8B4513');
    
    const centerStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    centerStop2.setAttribute('offset', '60%');
    centerStop2.setAttribute('stop-color', '#654321');
    
    const centerStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    centerStop3.setAttribute('offset', '100%');
    centerStop3.setAttribute('stop-color', '#3E2723');
    
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
        seed.setAttribute('fill', '#2E1A06');
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

// Manejar click en flor
function onFlowerClick(flowerElement) {
    // Añadir clase temporal para animación especial
    flowerElement.classList.add('clicked');
    setTimeout(() => {
        flowerElement.classList.remove('clicked');
    }, 1000);
}

// Manejar hover en flor
function onFlowerHover(flowerElement) {
    flowerElement.style.filter = 'brightness(1.2) drop-shadow(0 0 10px #ffeb3b)';
}

// Manejar salida del hover
function onFlowerLeave(flowerElement) {
    flowerElement.style.filter = '';
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
        const finalMessage = document.getElementById('finalMessage');
        if (finalMessage) {
            finalMessage.style.display = 'block';
            setTimeout(() => {
                finalMessage.style.opacity = '1';
            }, 100);
        }
    }, 1500); // Esperar 1.5 segundos después de que termine la última animación
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

