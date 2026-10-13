// State awal
let tasks = [
  { id: 1, judul: "Lab 10 event delegation", matkul: "Pemrograman Web", deadline: "2026-10-08", selesai: false },
  { id: 2, judul: "ERD sistem perpustakaan", matkul: "Basis Data", deadline: "2026-10-12", selesai: true },
];

const taskList = document.getElementById("taskList");

// Fungsi untuk merender daftar tugas
function render() {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
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

    // Aman: Menggunakan textContent untuk input user
    li.querySelector(".judul").textContent = task.judul;
    taskList.appendChild(li);
  });
}

// Panggil render saat halaman dimuat
render();

// Handle form tambah tugas
const taskForm = document.getElementById("taskForm");

taskForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const judul = document.getElementById("judulTugas").value.trim();
  const matkul = document.getElementById("mataKuliah").value;
  const deadline = document.getElementById("deadline").value;

  if (judul.length < 3) return; // Validasi minimal 3 karakter

  const newTask = {
    id: Date.now(), // Generate ID unik
    judul: judul,
    matkul: matkul,
    deadline: deadline,
    selesai: false,
  };

  tasks.push(newTask);
  taskForm.reset();
  render();
});

// Event Delegation untuk Checkbox Selesai & Tombol Hapus
taskList.addEventListener("click", function (e) {
  const li = e.target.closest(".task-item");
  if (!li) return;

  const id = Number(li.dataset.id);

  // Jika yang diklik adalah checkbox
  if (e.target.classList.contains("check-tugas")) {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.selesai = e.target.checked;
      render();
    }
  }

  // Jika yang diklik adalah tombol hapus X
  if (e.target.classList.contains("btn-hapus")) {
    tasks = tasks.filter((t) => t.id !== id);
    render();
  }
});
