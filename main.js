// ============================
// 1. Configuración de Materiales y Temperatura
// ============================
const materiales = {
    metal: { conductividad: 205, densidad: 7.85 },
    madera: { conductividad: 0.13, densidad: 0.6 },
    vidrio: { conductividad: 1.0, densidad: 2.5 }
};

let temperaturaCubo = 20;
const temperaturaAmbiente = 20;
const temperaturaMaxima = 1000;
let tasaCalor = 0.2;            // Inicializado por defecto
let tasaEnfriamiento = 0.05;    // Inicializado por defecto

// ============================
// 2. Selector de Material y Tabla de Información
// ============================
const materialSelector = document.getElementById('materialSelector');
const materialInfoTable = document.getElementById('materialInfoTable');

// Función para actualizar la tabla de información del material
materialSelector.addEventListener('change', (event) => {
    const material = event.target.value;
    const info = materiales[material];
    
    materialInfoTable.innerHTML = `
        <tr><th>Material</th><th>Conductividad</th><th>Densidad</th></tr>
        <tr><td>${material}</td><td>${info.conductividad}</td><td>${info.densidad}</td></tr>
    `;
    
    // Ajustar las tasas de calentamiento y enfriamiento en función del material seleccionado
    ajustarTasas(info.conductividad, info.densidad);
});

// Función para ajustar las tasas en función de las propiedades del material
function ajustarTasas(conductividad, densidad) {
    tasaCalor = conductividad / 1000;       // Valor relativo a la conductividad térmica
    tasaEnfriamiento = densidad / 100;      // Valor relativo a la densidad
}

// ============================
// 3. Configuración de Gráfica de Temperatura en Tiempo Real
// ============================
const ctx = document.getElementById('temperatureChart').getContext('2d');
const temperatureChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],   // Tiempos en segundos
        datasets: [{
            label: 'Temperatura del Cubo (°C)',
            data: [],
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: { 
                title: { display: true, text: 'Tiempo (s)' },
                min: 0, // Asegura que el eje x comience en 0
                 // Establece un rango inicial adecuado
            },
            y: { 
                title: { display: true, text: 'Temperatura (°C)' },
                suggestedMin: 15, // Establece un rango inicial adecuado
                suggestedMax: 45 
            }
        },
        animation: {
            duration: 1  // Deshabilita animación para actualizar más suavemente
        }
    }
});

// Variable para controlar el tiempo
let tiempo = 0;  // Tiempo inicial en segundos

// Actualización de la gráfica en intervalos de tiempo constantes (cada segundo)
function actualizarGraficaTemperatura() {
    // Actualizar el tiempo en intervalos de un segundo
    tiempo += 1;
    
    // Añadir el tiempo y la temperatura actual al dataset
    temperatureChart.data.labels.push(tiempo.toString());
    temperatureChart.data.datasets[0].data.push(temperaturaCubo);
    
    // Limitar la cantidad de puntos en la gráfica para que no crezca indefinidamente
    if (temperatureChart.data.labels.length > 100000) {
        temperatureChart.data.labels.suggestedMax = tiempo;
        temperatureChart.data.datasets[0].ChartData.labels.suggestedMax = tiempo;
    }
    
    
    temperatureChart.options.scales.x.min = Math.max(0, tiempo - 100);
    temperatureChart.options.scales.x.max = tiempo;

    // Actualizar la gráfica
    temperatureChart.update();
}



// ============================
// 4. Configuración de la Escena de Three.js
// ============================
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cubo del material
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const materialCube = new THREE.Mesh(geometry, material);
scene.add(materialCube);

// Fuente de calor
const fuegoGeometry = new THREE.PlaneGeometry(1, 1);
const fuegoMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
const fuego = new THREE.Mesh(fuegoGeometry, fuegoMaterial);
fuego.position.y = -2;
scene.add(fuego);

// Plano invisible para mover el cubo
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshBasicMaterial({ visible: false });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
scene.add(ground);

// ============================
// 5. Actualización de la Temperatura y Termómetro
// ============================
function actualizarTermometro(temperatura) {
    document.getElementById('tempValue').innerText = temperatura.toFixed(1);
}

function actualizarTemperatura() {
    const distancia = materialCube.position.distanceTo(fuego.position);
    
    if (distancia < 2) {  // Si está cerca de la fuente de calor
        temperaturaCubo = Math.min(temperaturaCubo + tasaCalor, temperaturaMaxima);
    } else {  // Si se está enfriando
        temperaturaCubo = Math.max(temperaturaCubo - tasaEnfriamiento, temperaturaAmbiente);
    }
    
    actualizarTermometro(temperaturaCubo);
    actualizarGraficaTemperatura();
}

// ============================
// 6. Animación y Eventos de Arrastre del Cubo
// ============================
let isDragging = false;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousedown', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(materialCube);
    if (intersects.length > 0) {
        isDragging = true;
    }
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

window.addEventListener('mousemove', (event) => {
    if (isDragging) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(ground);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            materialCube.position.x = point.x;
            materialCube.position.y = point.y;
        }
    }
});

// ============================
// 7. Ciclo de Animación Principal
// ============================
let intervaloAnimacion;
function animate() {
    clearInterval(intervaloAnimacion);

    requestAnimationFrame(animate);
    actualizarTemperatura();

    // Configura el intervalo de actualización cada segundo
    intervaloAnimacion = setInterval(() => {
        actualizarTemperatura();
        actualizarGraficaTemperatura();
    }, 1000);

    renderer.render(scene, camera);
}

animate();
