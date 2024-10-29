// script.js

let materials = [
    { id: 1, temp: Array(10).fill(20), conductivity: 0.5 },
    { id: 2, temp: Array(10).fill(20), conductivity: 0.3 },
    { id: 3, temp: Array(10).fill(20), conductivity: 0.7 }
];

let heatSourceTemp = 100;
let interval;
let heatSinkTemp = 20;

// Crear segmentos para cada material
function initializeSegments() {
    materials.forEach(material => {
        const segmentContainer = document.getElementById(`material${material.id}-segments`);
        segmentContainer.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const segment = document.createElement('div');
            segment.className = 'segment';
            segmentContainer.appendChild(segment);
        }
    });
}

initializeSegments();

function setHeatSourceTemp() {
    const input = document.getElementById('heat-source-temp').value;
    heatSourceTemp = parseFloat(input) || 100;
    document.getElementById("heat-source").style.backgroundColor = tempToColor(heatSourceTemp);
}

function startSimulation() {
    clearInterval(interval);
    interval = setInterval(() => {
        updateTemperatures();
        updateVisuals();
    }, 1000);
}

function stopSimulation() {
    clearInterval(interval);
}

function updateTemperatures() {
    materials.forEach(material => {
        for (let i = 0; i < material.temp.length; i++) {
            const previousTemp = i === 0 ? heatSourceTemp : material.temp[i - 1];
            const heatFlow = material.conductivity * (previousTemp - material.temp[i]);
            material.temp[i] += heatFlow * 0.01;
        }
    });

    const finalSegmentTemp = materials[materials.length - 1].temp[9];
    const heatFlowToSink = materials[materials.length - 1].conductivity * (finalSegmentTemp - heatSinkTemp);
    heatSinkTemp += heatFlowToSink * 0.01;
}

function updateVisuals() {
    document.getElementById("heat-source").style.backgroundColor = tempToColor(heatSourceTemp);

    materials.forEach(material => {
        const segments = document.querySelectorAll(`#material${material.id}-segments .segment`);
        let totalTemp = 0;

        material.temp.forEach((temp, index) => {
            segments[index].style.backgroundColor = tempToColor(temp);
            totalTemp += temp;
        });

        const avgTemp = (totalTemp / material.temp.length).toFixed(1);
        document.getElementById(`material${material.id}-temp-display`).textContent = `${avgTemp}°C`;
    });

    document.getElementById("heat-sink").style.backgroundColor = tempToColor(heatSinkTemp);
}

function tempToColor(temp) {
    let r, g, b;
    if (temp < 50) {
        r = 0;
        g = 0;
        b = 255 - temp * 2;
    } else if (temp < 100) {
        r = (temp - 50) * 5;
        g = 0;
        b = 255 - (temp - 50) * 5;
    } else {
        r = 255;
        g = (temp - 100) * 2;
        b = 0;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

function showInfo() {
    let info = `Fuente de Calor: ${heatSourceTemp}°C\n`;
    materials.forEach(material => {
        info += `Material ${material.id}: Temp Promedio = ${(material.temp.reduce((a, b) => a + b, 0) / material.temp.length).toFixed(1)}°C, Conductividad = ${material.conductivity}\n`;
    });
    info += `Receptor de Calor: ${heatSinkTemp.toFixed(1)}°C\n`;
    alert(info);
}

function editMaterial(id) {
    const conductivity = prompt("Ingrese conductividad térmica para Material " + id + " (0.1 - 1):", materials[id - 1].conductivity);
    materials[id - 1].conductivity = parseFloat(conductivity);
}

function resetSimulation() {
    materials.forEach(material => material.temp.fill(20));
    heatSinkTemp = 20;
    updateVisuals();
}

initializeSegments();
updateVisuals();


