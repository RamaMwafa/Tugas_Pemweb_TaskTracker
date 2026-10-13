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
