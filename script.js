const apiURL = "https://script.google.com/macros/s/AKfycbykvutv7M3ssejXq0CizSTIzv55eHWDEfq_LGlM7-pVRKUygeCblFibQ0YbdLmKedjV/exec";

let chartInstance;

// Fetch data dari Google Sheets
async function fetchData() {
    const response = await fetch(apiURL);
    const data = await response.json();
    return data;
}

// Mulai proses load
fetchData().then(allData => {
    console.log(allData); // Debug

    // Isi dropdown Puskesmas
    const puskesmasList = [...new Set(allData.map(x => x.puskesmas))];
    const filter = document.getElementById("filterPuskesmas");

    filter.innerHTML = `<option value="Semua">Semua</option>`;
    puskesmasList.forEach(ps => {
        filter.innerHTML += `<option value="${ps}">${ps}</option>`;
    });

    // Tampilkan default semua data
    displayData(allData);

    // Event ketika filter diganti
    filter.addEventListener("change", () => {
        const selected = filter.value;
        const filtered = selected === "Semua" ? allData : allData.filter(x => x.puskesmas === selected);
        displayData(filtered);
    });
});

// Fungsi menampilkan data
function displayData(data) {
    let asn = 0, nonasn = 0, laki = 0, perempuan = 0, oap = 0, nonoap = 0;

    data.forEach(row => {
        asn += Number(row.asn);
        nonasn += Number(row.nonasn);
        laki += Number(row.laki);
        perempuan += Number(row.perempuan);
        oap += Number(row.oap);
        nonoap += Number(row.nonoap);
    });

    document.getElementById("asn").textContent = asn;
    document.getElementById("nonasn").textContent = nonasn;
    document.getElementById("laki").textContent = laki;
    document.getElementById("perempuan").textContent = perempuan;
    document.getElementById("oap").textContent = oap;
    document.getElementById("nonoap").textContent = nonoap;

    updateChart(data);
}

// Grafik Chart.js
function updateChart(data) {
    const nakes = [
        data.reduce((sum, x) => sum + Number(x.dokter), 0),
        data.reduce((sum, x) => sum + Number(x.perawat), 0),
        data.reduce((sum, x) => sum + Number(x.bidan), 0),
    ];

    const ctx = document.getElementById("chartNakes");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Dokter", "Perawat", "Bidan"],
            datasets: [{
                label: "Jumlah Tenaga",
                data: nakes,
                backgroundColor: ["#0077cc", "#00aaff", "#66ccff"]
            }]
        }
    });
}
