const D0 = {
    umkm: [
        {
            id: 'admin',
            pw: 'admin123',
            role: 'admin',
            nama: 'Admin Utama',
            status: 'Aktif'
        },
        {
            id: '3578010101900001',
            pw: 'umkm123',
            role: 'user',
            nama: 'Warung Bu Sari',
            pemilik: 'Sari Wulandari',
            jenis: 'Kuliner',
            telp: '0812-3456-7801',
            tgl: '12 Jan 2026',
            status: 'Aktif'
        },
        {
            id: '3578010101900002',
            pw: 'umkm123',
            role: 'user',
            nama: 'Toko Maju Jaya',
            pemilik: 'Budi Hartono',
            jenis: 'Perdagangan',
            telp: '0813-2200-4412',
            tgl: '20 Jan 2026',
            status: 'Aktif'
        },
        {
            id: '3578010101900003',
            pw: 'umkm123',
            role: 'user',
            nama: 'Kedai Kopi Ayu',
            pemilik: 'Ayu Lestari',
            jenis: 'Kuliner',
            telp: '0857-1190-3305',
            tgl: '02 Feb 2026',
            status: 'Aktif'
        },
        {
            id: '3578010101900004',
            pw: 'umkm123',
            role: 'user',
            nama: 'Laundry Bersih Kilat',
            pemilik: 'Dewi Anggraini',
            jenis: 'Jasa',
            telp: '0852-4411-7723',
            tgl: '01 Mar 2026',
            status: 'Nonaktif'
        }
    ],

    pay: [
        {
            id: 1,
            uid: '3578010101900001',
            periode: '2026-10',
            omzet: 18000000,
            nominal: 90000,
            tanggal: '-',
            metode: '-',
            bukti: '',
            status: 'Belum Bayar'
        },
        {
            id: 2,
            uid: '3578010101900001',
            periode: '2026-09',
            omzet: 15500000,
            nominal: 77500,
            tanggal: '3 Okt 2026',
            metode: 'Transfer bank',
            bukti: 'warung-sari.jpg',
            status: 'Menunggu Verifikasi'
        },
        {
            id: 3,
            uid: '3578010101900001',
            periode: '2026-08',
            omzet: 17200000,
            nominal: 86000,
            tanggal: '5 Sep 2026',
            metode: 'QRIS',
            bukti: 'bukti-agu.jpg',
            status: 'Lunas'
        },
        {
            id: 4,
            uid: '3578010101900001',
            periode: '2026-07',
            omzet: 14000000,
            nominal: 70000,
            tanggal: '8 Agu 2026',
            metode: 'E-wallet',
            bukti: 'bukti-jul.jpg',
            status: 'Ditolak'
        },
        {
            id: 5,
            uid: '3578010101900001',
            periode: '2026-06',
            omzet: 16400000,
            nominal: 82000,
            tanggal: '4 Jul 2026',
            metode: 'Transfer bank',
            bukti: 'bukti-jun.jpg',
            status: 'Lunas'
        },
        {
            id: 6,
            uid: '3578010101900001',
            periode: '2026-05',
            omzet: 13000000,
            nominal: 65000,
            tanggal: '6 Jun 2026',
            metode: 'QRIS',
            bukti: 'bukti-mei.jpg',
            status: 'Lunas'
        },
        {
            id: 7,
            uid: '3578010101900002',
            periode: '2026-10',
            omzet: 25000000,
            nominal: 125000,
            tanggal: '5 Nov 2026',
            metode: 'QRIS',
            bukti: 'bukti-bayar.png',
            status: 'Menunggu Verifikasi'
        },
        {
            id: 8,
            uid: '3578010101900003',
            periode: '2026-10',
            omzet: 12000000,
            nominal: 60000,
            tanggal: '6 Nov 2026',
            metode: 'E-wallet',
            bukti: 'bukti-1.jpg',
            status: 'Menunggu Verifikasi'
        },
        {
            id: 9,
            uid: '3578010101900004',
            periode: '2026-09',
            omzet: 10800000,
            nominal: 54000,
            tanggal: '4 Okt 2026',
            metode: 'Transfer bank',
            bukti: 'laundry.pdf',
            status: 'Ditolak'
        },
        {
            id: 10,
            uid: '3578010101900002',
            periode: '2026-09',
            omzet: 22000000,
            nominal: 110000,
            tanggal: '3 Okt 2026',
            metode: 'Transfer bank',
            bukti: 'maju-sep.jpg',
            status: 'Lunas'
        }
    ],

    tax: {
        rate: 0.5,
        ambang: 500000000,
        batas: 4800000000,
        dasar: 'PP 55/2022'
    }
};

const BLN = [
    'Januari', 'Februari', 'Maret', 'April',
    'Mei', 'Juni', 'Juli', 'Agustus',
    'September', 'Oktober', 'November', 'Desember'
];

const KEY = 'pajakin_db',
    ROOT = document.body.dataset.root || '';

let DB;

try {
    DB = JSON.parse(localStorage.getItem(KEY));
} catch (e) {}

DB = DB || JSON.parse(JSON.stringify(D0));

window.umkmData = DB.umkm;
window.paymentData = DB.pay;
window.taxRate = DB.tax;

const save = () => {
    try {
        localStorage.setItem(
            KEY,
            JSON.stringify({
                umkm: umkmData,
                pay: paymentData,
                tax: taxRate
            })
        );
    } catch (e) {
        notify(
            'Penyimpanan browser penuh. Hapus data situs atau pakai gambar lebih kecil.',
            'danger'
        );
    }
};

const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');

const fmtP = p => {
    const [y, m] = p.split('-');
    return BLN[m - 1] + ' ' + y;
};

const tgl = () => {
    const d = new Date();

    return d.getDate() + ' ' +
        BLN[d.getMonth()].slice(0, 3) + ' ' +
        d.getFullYear();
};

const BC = {
    'Menunggu Verifikasi': 'warning',
    'Lunas': 'success',
    'Ditolak': 'danger',
    'Belum Bayar': 'secondary',
    'Aktif': 'success',
    'Nonaktif': 'secondary'
};

const bdg = s => `
    <span class="badge text-bg-${BC[s]} fw-normal">
        ${s}
    </span>
`;

const me = () => umkmData.find(
    u => u.id === sessionStorage.getItem('pj_user')
);

const logout = () => {
    sessionStorage.removeItem('pj_user');
    location.href = ROOT + 'login.html';
};

const guard = role => {
    const u = me();

    if (!u || u.role !== role) {
        location.href = ROOT + 'login.html';
    }
};

const table = (h, rows) => `
    <div class="table-responsive">
        <table class="table align-middle">
            <thead>
                <tr>
                    ${h.map(x => `<th>${x}</th>`).join('')}
                </tr>
            </thead>

            <tbody>
                ${(Array.isArray(rows) ? rows.join('') : rows) || `
                    <tr>
                        <td colspan="${h.length}" class="text-center text-muted py-4">
                            Data tidak ditemukan.
                        </td>
                    </tr>
                `}
            </tbody>
        </table>
    </div>
`;

const MENU = {
    user: [
        ['dashboard', 'Dashboard', 'grid'],
        ['hitung-pajak', 'Hitung Pajak', 'calculator'],
        ['bayar-pajak', 'Bayar Pajak', 'wallet2'],
        ['riwayat-pembayaran', 'Riwayat Pembayaran', 'clock-history']
    ],

    admin: [
        ['dashboard', 'Dashboard', 'grid'],
        ['data-umkm', 'Data UMKM', 'shop'],
        ['verifikasi-pembayaran', 'Verifikasi Pembayaran', 'patch-check'],
        ['laporan-keuangan', 'Laporan Keuangan', 'file-earmark-text'],
        ['tarif-pajak', 'Tarif Pajak', 'percent']
    ]
};

function render(title, sub, html, search) {
    const u = me(),
        pg = document.body.dataset.page;

    const nav = MENU[u.role].map(([f, t, i]) => `
        <a href="${f}.html" class="${f === pg ? 'on' : ''}">
            <i class="bi bi-${i}"></i>
            ${t}
        </a>
    `).join('');

    document.getElementById('app').innerHTML = `
        <div class="app">

            <aside class="sb">
                <div class="brand">
                    <img src="${ROOT}assets/images/logo-white.svg" class="logo" alt="">
                    PajakIn
                </div>

                <nav>
                    ${nav}
                </nav>

                <div class="usr">
                    <span class="av">
                        ${u.nama.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </span>

                    <div>
                        <b>${u.nama}</b>
                        <small>
                            ${u.role === 'admin' ? 'Administrator' : 'Pelaku UMKM'}
                        </small>
                    </div>

                    <button onclick="logout()" title="Keluar">
                        <i class="bi bi-box-arrow-right"></i>
                    </button>
                </div>
            </aside>

            <main>
                <header>
                    <div>
                        <h1>${title}</h1>
                        <p>${sub}</p>
                    </div>

                    ${search ? '<input id="q" class="form-control" placeholder="Cari...">' : ''}
                </header>

                ${html}
            </main>

        </div>
    `;
}

function notify(m, t = 'success') {
    const d = document.createElement('div');

    d.className = `alert alert-${t} toast-n shadow`;
    d.textContent = m;

    document.body.append(d);

    setTimeout(() => d.remove(), 2500);
}

function modal(title, body) {
    document.getElementById('mdl')?.remove();

    const d = document.createElement('div');

    d.id = 'mdl';
    d.className = 'modal fade';

    d.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">

                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body">
                    ${body}
                </div>

            </div>
        </div>
    `;

    document.body.append(d);
    new bootstrap.Modal(d).show();
}

function detail(id, extra = '') {
    const p = paymentData.find(x => x.id === id),
        u = umkmData.find(x => x.id === p.uid);

    modal(
        'Detail pembayaran',
        `
        <dl class="row mb-0">
            ${[
                ['UMKM', u.nama],
                ['Periode', fmtP(p.periode)],
                ['Omzet', rp(p.omzet)],
                ['Pajak', rp(p.nominal)],
                ['Tanggal bayar', p.tanggal],
                ['Metode', p.metode],
                ['Bukti', p.bukti || '-'],
                ['Status', bdg(p.status)]
            ].map(([k, v]) => `
                <dt class="col-5 text-muted fw-normal">${k}</dt>
                <dd class="col-7">${v}</dd>
            `).join('')}
        </dl>

        ${p.img ? `
            <img src="${p.img}" class="img-fluid rounded border mt-3" alt="Bukti pembayaran">
        ` : p.bukti ? `
            <div class="text-muted small mt-3">
                Pratinjau gambar tidak tersedia untuk file ini.
            </div>
        ` : ''}

        ${extra}
        `
    );
}

function pdf(title, head, rows, file) {
    if (!window.jspdf) {
        return notify(
            'Library jsPDF belum termuat. Periksa koneksi internet.',
            'danger'
        );
    }

    const d = new jspdf.jsPDF();

    d.setFontSize(14);
    d.text(title, 14, 16);

    d.setFontSize(10);

    let y = 28;

    d.text(head.join('   |   '), 14, y);

    rows.forEach(r => {
        y += 8;

        if (y > 280) {
            d.addPage();
            y = 20;
        }

        d.text(r.join('   |   '), 14, y);
    });

    d.save(file);
}

// ===== Helper dashboard: kartu rekap + grafik batang =====

const mShort = p => BLN[+p.slice(5) - 1].slice(0, 3);

const short = v => v >= 1e6
    ? (v / 1e6).toFixed(1).replace('.', ',') + ' jt'
    : v >= 1e3
        ? Math.round(v / 1e3) + ' rb'
        : String(v);

const months = (end, n = 6) => {
    let [y, m] = end.split('-').map(Number),
        r = [];

    for (let i = 0; i < n; i++) {
        r.unshift(y + '-' + String(m).padStart(2, '0'));

        if (--m < 1) {
            m = 12;
            y--;
        }
    }

    return r;
};

const stat = (i, l, v, s) => `
    <div class="col-md-4">
        <div class="card-x stat">
            <span class="ic">
                <i class="bi bi-${i}"></i>
            </span>

            <div>
                <small>${l}</small>
                <strong>${v}</strong>
                <small>${s}</small>
            </div>
        </div>
    </div>
`;

// list = daftar pembayaran yang dijumlahkan per periode (6 bulan terakhir)

const chart = list => {
    const ms = months(
        paymentData.map(p => p.periode).sort().pop()
    );

    const d = ms.map(p =>
        list.filter(x => x.periode === p)
            .reduce((a, x) => a + x.nominal, 0)
    );

    const mx = Math.max(...d, 1);

    return `
        <div class="bars">
            ${d.map((v, i) => `
                <div class="bc">
                    <small>${v ? short(v) : '-'}</small>

                    <div
                        class="bar ${i === 5 ? 'on' : ''}"
                        style="height:${Math.max(Math.round(v / mx * 120), 3)}px"
                    ></div>

                    <span>${mShort(ms[i])}</span>
                </div>
            `).join('')}
        </div>
    `;
};

// Baca file gambar, kecilkan (maks 800px) lalu ubah jadi teks base64 agar muat di localStorage

const readImg = f => new Promise(res => {
    if (!f || !f.type.startsWith('image/')) {
        return res('');
    }

    const r = new FileReader();

    r.onload = () => {
        const i = new Image();

        i.onload = () => {
            const s = Math.min(1, 800 / Math.max(i.width, i.height)),
                c = document.createElement('canvas'),
                x = c.getContext('2d');

            c.width = Math.round(i.width * s);
            c.height = Math.round(i.height * s);

            x.fillStyle = '#fff';
            x.fillRect(0, 0, c.width, c.height);
            x.drawImage(i, 0, 0, c.width, c.height);

            res(c.toDataURL('image/jpeg', .7));
        };

        i.onerror = () => res('');
        i.src = r.result;
    };

    r.onerror = () => res('');
    r.readAsDataURL(f);
});