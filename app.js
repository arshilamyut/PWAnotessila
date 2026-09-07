let catatan = JSON.parse(
    localStorage.getItem("catatan")
) || [];

// Migrasi data lama supaya field baru tidak undefined.
catatan = catatan.map(function(data) {

    return Object.assign(
        {
            warna: "biru",
            pinned: false,
            dibuat: data.id,
            diubah: data.id
        },
        data
    );

});


let editingId = null;
let warnaTerpilih = "biru";

// Menyimpan catatan yang baru dihapus sementara, untuk fitur "Urungkan".
let dataDihapusSementara = null;
let timerHapus = null;


/* ---------- Utilitas ---------- */

function simpanData() {

    localStorage.setItem(
        "catatan",
        JSON.stringify(catatan)
    );

}


function formatWaktu(timestamp) {

    let tanggal = new Date(timestamp);

    return tanggal.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}


const warnaMap = {
    biru: { bg: "#EAF1FF", border: "#5B8DEF" },
    pink: { bg: "#FFEFF6", border: "#FF8FC0" },
    lavender: { bg: "#F3EEFF", border: "#B79CFF" },
    mint: { bg: "#E7FBF1", border: "#3FC98A" },
    kuning: { bg: "#FFF8DE", border: "#F2B705" }
};


/* ---------- Toast & Undo ---------- */

function tampilkanToast(pesan, opsi) {

    opsi = opsi || {};

    let container = document.getElementById("toastContainer");

    let toast = document.createElement("div");
    toast.className = "toast";

    let teks = document.createElement("span");
    teks.textContent = pesan;
    toast.appendChild(teks);

    if (opsi.aksiLabel && opsi.onAksi) {

        let tombol = document.createElement("button");
        tombol.className = "aksi-toast";
        tombol.textContent = opsi.aksiLabel;

        tombol.onclick = function() {
            opsi.onAksi();
            toast.remove();
        };

        toast.appendChild(tombol);
    }

    container.appendChild(toast);

    setTimeout(function() {
        toast.remove();
    }, opsi.durasi || 3000);

}


/* ---------- Modal form ---------- */

function pilihWarna(warna) {

    warnaTerpilih = warna;

    document.querySelectorAll(".swatch").forEach(function(el) {

        el.classList.toggle(
            "selected",
            el.dataset.warna === warna
        );

    });

}


function updateHitungKarakter() {

    let panjang = document.getElementById("isi").value.length;

    document.getElementById("hitungKarakter").textContent =
        panjang + " / 1000 karakter";

}


function bukaForm(id) {

    let overlay = document.getElementById("overlay");
    overlay.classList.add("terbuka");

    if (id) {

        let data = catatan.find(function(item) {
            return item.id === id;
        });

        if (!data) {
            return;
        }

        editingId = id;

        document.getElementById("judulSheet").textContent = "Edit Catatan";
        document.getElementById("judul").value = data.judul;
        document.getElementById("isi").value = data.isi;
        pilihWarna(data.warna || "biru");
        document.getElementById("btnSimpan").textContent = "Update Catatan";

    } else {

        editingId = null;

        document.getElementById("judulSheet").textContent = "Catatan Baru";
        document.getElementById("judul").value = "";
        document.getElementById("isi").value = "";
        pilihWarna("biru");
        document.getElementById("btnSimpan").textContent = "Simpan Catatan";

    }

    updateHitungKarakter();

    setTimeout(function() {
        document.getElementById("judul").focus();
    }, 200);

}


function tutupForm(event) {

    if (event && event.target !== document.getElementById("overlay")) {
        return;
    }

    document.getElementById("overlay").classList.remove("terbuka");
    editingId = null;

}


/* ---------- Confetti ---------- */

function tembakConfetti() {

    let warnaConfetti = ["#5B8DEF", "#FF8FC0", "#B79CFF", "#FFC857", "#3FC98A"];

    let fab = document.getElementById("fab");
    let posisi = fab.getBoundingClientRect();

    for (let i = 0; i < 14; i++) {

        let partikel = document.createElement("div");
        partikel.className = "confetti";

        let sudut = Math.random() * Math.PI * 2;
        let jarak = 60 + Math.random() * 60;

        partikel.style.left = (posisi.left + posisi.width / 2) + "px";
        partikel.style.top = (posisi.top + posisi.height / 2) + "px";
        partikel.style.background =
            warnaConfetti[Math.floor(Math.random() * warnaConfetti.length)];
        partikel.style.setProperty("--tx", Math.cos(sudut) * jarak + "px");
        partikel.style.setProperty("--ty", Math.sin(sudut) * jarak - 40 + "px");
        partikel.style.setProperty("--rot", (Math.random() * 360) + "deg");

        document.body.appendChild(partikel);

        setTimeout(function() {
            partikel.remove();
        }, 700);

    }

}


/* ---------- Pencapaian ---------- */

function cekPencapaian() {

    let tonggak = {
        1: "🌸 Catatan pertamamu tersimpan!",
        5: "✨ 5 catatan terkumpul, keren!",
        10: "💫 10 catatan! Kamu rajin sekali~",
        25: "🎀 25 catatan tercapai, luar biasa!",
        50: "👑 50 catatan! Kamu juara menulis!"
    };

    let jumlah = catatan.length;

    if (tonggak[jumlah]) {

        let sudahMuncul = JSON.parse(
            localStorage.getItem("pencapaian_ditampilkan")
        ) || [];

        if (!sudahMuncul.includes(jumlah)) {

            tampilkanToast(tonggak[jumlah], { durasi: 3500 });

            sudahMuncul.push(jumlah);

            localStorage.setItem(
                "pencapaian_ditampilkan",
                JSON.stringify(sudahMuncul)
            );

        }

    }

}


/* ---------- CRUD catatan ---------- */

function simpanCatatan() {

    let judul = document.getElementById("judul").value.trim();
    let isi = document.getElementById("isi").value.trim();

    if (judul === "" || isi === "") {

        tampilkanToast("Judul dan isi catatan harus diisi!");

        return;
    }

    if (editingId === null) {

        let sekarang = Date.now();

        catatan.push({
            id: sekarang,
            judul: judul,
            isi: isi,
            warna: warnaTerpilih,
            pinned: false,
            dibuat: sekarang,
            diubah: sekarang
        });

        tembakConfetti();
        tampilkanToast("Catatan tersimpan 🩵");

    } else {

        catatan = catatan.map(function(data) {

            if (data.id === editingId) {

                return Object.assign({}, data, {
                    judul: judul,
                    isi: isi,
                    warna: warnaTerpilih,
                    diubah: Date.now()
                });

            }

            return data;

        });

        tampilkanToast("Catatan diperbarui ✨");

    }


    simpanData();
    tutupForm();
    tampilkanCatatan();
    cekPencapaian();

}


function togglePin(id) {

    catatan = catatan.map(function(data) {

        if (data.id === id) {
            return Object.assign({}, data, { pinned: !data.pinned });
        }

        return data;

    });

    simpanData();
    tampilkanCatatan();

}


function hapusCatatan(id) {

    let index = catatan.findIndex(function(item) {
        return item.id === id;
    });

    if (index === -1) {
        return;
    }

    dataDihapusSementara = catatan[index];
    let indexAsli = index;

    catatan = catatan.filter(function(item) {
        return item.id !== id;
    });

    if (editingId === id) {
        tutupForm();
    }

    simpanData();
    tampilkanCatatan();

    clearTimeout(timerHapus);

    tampilkanToast('Catatan "' + dataDihapusSementara.judul + '" dihapus', {
        aksiLabel: "Urungkan",
        durasi: 4000,
        onAksi: function() {

            catatan.splice(indexAsli, 0, dataDihapusSementara);
            simpanData();
            tampilkanCatatan();
            dataDihapusSementara = null;

        }
    });

}


/* ---------- Ekspor ---------- */

function eksporSemua() {

    if (catatan.length === 0) {

        tampilkanToast("Belum ada catatan untuk diekspor");

        return;
    }

    let urutan = catatan.slice().sort(function(a, b) {
        return b.diubah - a.diubah;
    });

    let teks = urutan.map(function(data) {

        return data.judul + "\n"
            + "(" + formatWaktu(data.diubah) + ")\n"
            + data.isi + "\n";

    }).join("\n-----------------------\n\n");

    let blob = new Blob([teks], { type: "text/plain;charset=utf-8" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "catatan-notes-app.txt";
    a.click();

    URL.revokeObjectURL(url);

    tampilkanToast("Catatan berhasil diekspor 📄");

}


/* ---------- Render ---------- */

const iconPin = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L14 8L20 9L15.5 13L17 20L12 16.5L7 20L8.5 13L4 9L10 8L12 2Z" fill="currentColor"/></svg>';

const iconEdit = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20L4.7 16.5L15.3 5.9C15.9 5.3 16.9 5.3 17.5 5.9L18.1 6.5C18.7 7.1 18.7 8.1 18.1 8.7L7.5 19.3L4 20Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';

const iconHapus = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M9 7V4H15V7" stroke="currentColor" stroke-width="2"/><path d="M7 7L8 20H16L17 7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>';


function tampilkanCatatan() {

    let daftar = document.getElementById("daftarCatatan");
    let kataKunci = document.getElementById("pencarian").value.trim().toLowerCase();

    let hasil = catatan.filter(function(data) {

        return data.judul.toLowerCase().includes(kataKunci)
            || data.isi.toLowerCase().includes(kataKunci);

    });

    hasil.sort(function(a, b) {

        if (a.pinned !== b.pinned) {
            return a.pinned ? -1 : 1;
        }

        return b.diubah - a.diubah;

    });


    document.getElementById("subtitle").textContent =
        catatan.length === 0
            ? "Belum ada catatan"
            : catatan.length + " catatan tersimpan";


    if (hasil.length === 0) {

        daftar.innerHTML = catatan.length === 0
            ? '<div class="empty-state"><span class="emoji">📭</span><p>Belum ada catatan, yuk tulis yang pertama!</p></div>'
            : '<div class="empty-state"><span class="emoji">🔍</span><p>Catatan tidak ditemukan</p></div>';

        return;
    }


    daftar.innerHTML = "";

    hasil.forEach(function(data) {

        let warna = warnaMap[data.warna] || warnaMap.biru;

        daftar.innerHTML += `

            <div class="catatan${data.pinned ? " pinned" : ""}" style="background:${warna.bg}; border-left-color:${warna.border}">

                <div class="tape" style="background:${warna.border}"></div>

                <div class="catatan-header">

                    <h3>${data.judul}</h3>

                    <div class="aksi">

                        <button
                            class="btn-pin${data.pinned ? " aktif" : ""}"
                            title="Sematkan"
                            onclick="togglePin(${data.id})">
                            ${iconPin}
                        </button>

                        <button
                            class="btn-edit"
                            title="Edit"
                            onclick="bukaForm(${data.id})">
                            ${iconEdit}
                        </button>

                        <button
                            class="btn-hapus"
                            title="Hapus"
                            onclick="hapusCatatan(${data.id})">
                            ${iconHapus}
                        </button>

                    </div>

                </div>

                <p>${data.isi}</p>

                <span class="waktu">
                    ${data.dibuat === data.diubah
                        ? "Dibuat " + formatWaktu(data.dibuat)
                        : "Diedit " + formatWaktu(data.diubah)}
                </span>

            </div>

        `;

    });
}


tampilkanCatatan();


/* ---------- Service Worker ---------- */

if ("serviceWorker" in navigator) {

    navigator.serviceWorker
        .register("service-worker.js")

        .then(function() {

            console.log("Service Worker berhasil dijalankan");

        })

        .catch(function(error) {

            console.log("Service Worker gagal:", error);

        });

}