// Global State
let tasks = [];
let currentFilter = "semua";

const taskList = document.getElementById("taskList");
const taskForm = document.getElementById("taskForm");
const mataKuliahSelect = document.getElementById("mataKuliah");
const uiStatus = document.getElementById("ui-status");

// Helper API Sementara (akan disempurnakan di Tahap 5)
async function api(endpoint, options = {}) {
  const res = await fetch(endpoint, options);
  if (res.status === 204) return null; // Handle DELETE
  return res.json();
}

// Fitur Paralel: Muat Tugas dan Daftar Matkul
async function loadData() {
  try {
    const [tugasData, matkulData] = await Promise.all([api("/api/tugas"), api("/api/matkul")]);

    tasks = tugasData;

    // Populate Dropdown Matkul
    matkulData.forEach((mk) => {
      const option = document.createElement("option");
      // Menyesuaikan format dari API (apakah object atau string)
      const nama = typeof mk === "string" ? mk : mk.nama;
      option.value = nama;
      option.textContent = nama;
      mataKuliahSelect.appendChild(option);
    });

    // render() dipanggil di sini nanti
  } catch (error) {
    console.error(error);
  }
}

// Inisialisasi
loadData();
