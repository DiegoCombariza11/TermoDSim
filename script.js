// script.js

let materials = [
    { id: 1, temp: Array(10).fill(20), conductivity: 0.5 },
    { id: 2, temp: Array(10).fill(20), conductivity: 0.3 },
    { id: 3, temp: Array(10).fill(20), conductivity: 0.7 }
];

let heatSourceTemp = 100;
let interval;
let heatSinkTemp = 0;

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

    const heatSinkSegments = document.getElementById("heat-sink-segments");
    heatSinkSegments.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        const segment = document.createElement('div');
        segment.className = 'segment';
        heatSinkSegments.appendChild(segment);
    }
}


initializeSegments();

function showInfo() {
    window.location.href = 'index2.html'; 
}


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
    }, 100);
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

    materials.forEach((material, index) => {
        const finalSegmentTemp = material.temp[material.temp.length - 1];
        const heatFlowToSink = material.conductivity * (finalSegmentTemp - heatSinkTemp);
        heatSinkTemp += heatFlowToSink * 0.01 / 3; // Dividir en 3 partes
    });
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

    // Actualizar la tabla de información
    updateInfoTable();
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

function calculateEnergy(material) {
    let totalEnergy = 0;
    for (let i = 1; i < material.temp.length; i++) {
        const deltaTemp = Math.abs(material.temp[i] - material.temp[i - 1]);
        const segmentEnergy = material.conductivity * deltaTemp * 0.01; // Factor de tiempo
        totalEnergy += segmentEnergy;
    }
    return totalEnergy.toFixed(2);
}


function updateInfoTable() {
    const infoTable = document.getElementById("info-table");
    infoTable.innerHTML = ''; // Clear previous content

    const table = document.createElement("table");

    // Table header
    table.innerHTML = `
        <thead>
            <tr>
                <th>Elemento</th>
                <th>Temperatura Promedio (°C)</th>
                <th>Conductividad</th>
                <th>Energía Transferida (J)</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement("tbody");

    // Heat Source row
    let row = document.createElement("tr");
    row.innerHTML = `
        <td>Fuente de Calor</td>
        <td>${heatSourceTemp}°C</td>
        <td>-</td>
        <td>-</td>
    `;
    tbody.appendChild(row);

    // Materials rows
    materials.forEach(material => {
        const avgTemp = (material.temp.reduce((a, b) => a + b, 0) / material.temp.length).toFixed(1);
        const energy = calculateEnergy(material);
        row = document.createElement("tr");
        row.innerHTML = `
            <td>Material ${material.id}</td>
            <td>${avgTemp}°C</td>
            <td>${material.conductivity}</td>
            <td>${energy} J</td>
        `;
        tbody.appendChild(row);
    });

    // Heat Sink row
    row = document.createElement("tr");
    row.innerHTML = `
        <td>Receptor de Calor</td>
        <td>${heatSinkTemp.toFixed(1)}°C</td>
        <td>-</td>
        <td>-</td>
    `;
    tbody.appendChild(row);

    table.appendChild(tbody);
    infoTable.appendChild(table);
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


