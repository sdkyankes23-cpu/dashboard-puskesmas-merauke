const apiURL = "https://script.google.com/macros/s/AKfycbykvutv7M3ssejXq0CizSTIzv55eHWDEfq_LGlM7-pVRKUygeCblFibQ0YbdLmKedjV/exec";

let chartInstance;

// Fetch data dari Google Sheets
async function fetchData() {
    const response = await fetch(apiURL);
    const json = await response.json();

    const headers = json.headers[0]; // header baris pertama
    const rows = json.rows;

    // Convert rows ke array objek
    const data = rows.map(r => {
        let obj = {};
        headers.forEach((h, i) => {
            obj[h] = r[i];
        });
        return {
            puskesmas: obj["NAMA PUSKESMAS"],
            asn: Number(obj["ASN"] || 0),
            nonasn: Number(obj["Non-ASN"] || 0),
            laki: Number(obj["LAKI - LAKI"] || 0),
            perempuan: Number(obj["PEREMPUAN"] || 0),
            oap: Number(obj["OAP"] || 0),
            nonoap: Number(obj["NON-OAP"] || 0),
            dokter: Number(obj["Dokter Umum"] || 0),
            perawat: Number(obj["Keperawatan"] || 0),
            bidan: Number(obj["Kebidanan"] || 0)
        };
    });

    return data;
}


// Mulai proses load
fetchData().then(allData => {
    console.log(allData); // Debug

    const puskesmasList = [...new Set(allData.map(x => x.puskesmas))];
    const filter = document.getElementById("filterPuskesmas");

    filter.innerHTML = `<option value="Semua">Semua</option>`;
    puskesmasList.forEach(ps => {
        filter.innerHTML += `<option value="${ps}">${ps}</option>`;
    });

    displayData(allData);

    filter.addEventListener("change", () => {
        const selected = filter.value;
        const filtered = selected === "Semua"
            ? allData
            : allData.filter(x => x.puskesmas === selected);
        displayData(filtered);
    });
});


// Fungsi menampilkan data
function displayData(data) {
    let asn = 0, nonasn = 0, laki = 0, perempuan = 0, oap = 0, nonoap = 0;

    data.forEach(row => {
        asn += row.asn;
        nonasn += row.nonasn;
        laki += row.laki;
        perempuan += row.perempuan;
        oap += row.oap;
        nonoap += row.nonoap;
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
        data.reduce((sum, x) => sum + x.dokter, 0),
        data.reduce((sum, x) => sum + x.perawat, 0),
        data.reduce((sum, x) => sum + x.bidan, 0),
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
