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

// Helper untuk UI Status (Loading / Error)
function renderStatus(pesan, isError = false) {
    uiStatus.textContent = pesan;
    uiStatus.style.color = isError ? "#ff003c" : "#e6c200";
    uiStatus.style.display = pesan ? "block" : "none";
}

// Fungsi Render Utama
function render() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;
    if (currentFilter === "aktif") filteredTasks = tasks.filter((t) => !t.selesai);
    else if (currentFilter === "selesai") filteredTasks = tasks.filter((t) => t.selesai);

    // Empty State
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<p style="text-align:center; color:#888;">Data tugas kosong.</p>`;
    }

    filteredTasks.forEach((task) => {
        const li = document.createElement("li");
        li.className = `task-item ${task.selesai ? "selesai" : ""}`;
        li.dataset.id = task.id;

        li.innerHTML = `
            <input type="checkbox" class="check-tugas" ${task.selesai ? "checked" : ""}>
            <div class="task-info">
                <span class="judul"></span>
                <span class="meta-data">${task.matkul} // Deadline: ${task.deadline}</span>
            </div>
            <button class="btn-hapus">X</button>
        `;
        li.querySelector(".judul").textContent = task.judul;
        taskList.appendChild(li);
    });

    const activeTasksCount = tasks.filter((t) => !t.selesai).length;
    document.getElementById("taskCounter").textContent = activeTasksCount === 0 ? "TIDAK ADA TUGAS AKTIF" : `${activeTasksCount} TUGAS AKTIF`;
}

// Update fungsi loadData (Timpa fungsi loadData lama dengan yang ini)
async function loadData() {
    try {
        renderStatus("MEMUAT DATA DARI SERVER..."); // State Loading
        
        const [tugasData, matkulData] = await Promise.all([
            api('/api/tugas'),
            api('/api/matkul')
        ]);
        
        tasks = tugasData;
        
        matkulData.forEach(mk => {
            const option = document.createElement('option');
            const nama = typeof mk === 'string' ? mk : mk.nama;
            option.value = nama;
            option.textContent = nama;
            mataKuliahSelect.appendChild(option);
        });
        
        renderStatus(""); // Sembunyikan loading
        render();
    } catch (error) {
        renderStatus("GAGAL MEMUAT DATA SERVER!", true); // State Error
    }
}

const btnTambah = document.getElementById("btnTambah");

taskForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const judul = document.getElementById("judulTugas").value.trim();
    const matkul = mataKuliahSelect.value;
    const deadline = document.getElementById("deadline").value;

    if (judul.length < 3) return;

    try {
        btnTambah.disabled = true;
        btnTambah.textContent = "MENGIRIM...";
        renderStatus("");

        const newTaskPayload = { judul, matkul, deadline, selesai: false };

        const savedTask = await api('/api/tugas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTaskPayload)
        });

        tasks.push(savedTask);
        taskForm.reset();
        render();
    } catch (error) {
        renderStatus(error.message, true);
    } finally {
        btnTambah.disabled = false;
        btnTambah.textContent = "TAMBAH";
    }
});

// Event Listener Filter UI
document.querySelectorAll(".btn-filter").forEach(btn => {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".btn-filter").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.dataset.filter;
        render();
    });
});

taskList.addEventListener("click", async function (e) {
    const li = e.target.closest(".task-item");
    if (!li) return;
    
    const id = li.dataset.id;
    const task = tasks.find((t) => t.id == id);
    if (!task) return;

    // Aksi Ubah Status (PATCH)
    if (e.target.classList.contains("check-tugas")) {
        const isChecked = e.target.checked;
        e.target.disabled = true; // Lock sementara

        try {
            await api(`/api/tugas/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selesai: isChecked })
            });
            task.selesai = isChecked;
            render();
        } catch (error) {
            e.target.checked = !isChecked; // Revert jika API gagal
            e.target.disabled = false;
            renderStatus(error.message, true);
        }
    }

    // Aksi Hapus (DELETE)
    if (e.target.classList.contains("btn-hapus")) {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = "...";

        try {
            await api(`/api/tugas/${id}`, { method: 'DELETE' });
            tasks = tasks.filter((t) => t.id != id);
            render();
        } catch (error) {
            btn.disabled = false;
            btn.textContent = "X";
            renderStatus(error.message, true);
        }
    }
});
