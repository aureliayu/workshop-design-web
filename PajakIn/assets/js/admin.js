guard('admin');

const PAGES = {};
const STATUS_LIST = ['Menunggu Verifikasi', 'Lunas', 'Ditolak'];
const STATUS_LABELS = {
  'Menunggu Verifikasi': 'Menunggu',
  Lunas: 'Disetujui',
  Ditolak: 'Ditolak',
};

const $ = (id) => document.getElementById(id);
const getTransactions = () => paymentData.filter((p) => p.status !== 'Belum Bayar');
const getUmkmName = (id) => umkmData.find((u) => u.id === id)?.nama ?? '-';

// --- DASHBOARD ---
PAGES.dashboard = () => {
  const trx = getTransactions();
  const paidTrx = trx.filter((p) => p.status === 'Lunas');
  const users = umkmData.filter((u) => u.role === 'user');
  const activeUsersCount = users.filter((u) => u.status === 'Aktif').length;
  const totalTax = paidTrx.reduce((sum, p) => sum + p.nominal, 0);
  const countByStatus = (status) => trx.filter((p) => p.status === status).length;

  const statsRow = [
    stat('people', 'UMKM terdaftar', users.length, `${activeUsersCount} akun aktif`),
    stat('clock', 'Menunggu verifikasi', countByStatus('Menunggu Verifikasi'), 'Perlu diperiksa'),
    stat('wallet2', 'Pajak terkumpul', rp(totalTax), `Dari ${paidTrx.length} transaksi lunas`),
  ].join('');

  const statusBreakdown = [
    ['Disetujui', 'Lunas', 'success'],
    ['Menunggu', 'Menunggu Verifikasi', 'warning'],
    ['Ditolak', 'Ditolak', 'danger'],
  ]
    .map(([label, status, variant]) => {
      const count = countByStatus(status);
      const pct = trx.length ? (count / trx.length) * 100 : 0;
      return `
        <div class="d-flex justify-content-between small">
          <span>${label}</span><b>${count}</b>
        </div>
        <div class="progress mb-3" style="height:6px">
          <div class="progress-bar bg-${variant}" style="width:${pct}%"></div>
        </div>`;
    })
    .join('');

  const recentRows = trx
    .slice(-5)
    .reverse()
    .map(
      (p) => `
        <tr>
          <td>${getUmkmName(p.uid)}</td>
          <td>${fmtP(p.periode)}</td>
          <td>${rp(p.nominal)}</td>
          <td>${bdg(p.status)}</td>
        </tr>`
    )
    .join('');

  render(
    'Halo, Admin',
    'Ringkasan pajak dan pembayaran UMKM.',
    `
    <div class="row g-3 mb-3">${statsRow}</div>
    <div class="row g-3 mb-3">
      <div class="col-lg-8">
        <div class="card-x">
          <h2>Pajak terkumpul per bulan</h2>
          <p class="small text-muted mb-1">6 bulan terakhir, hanya pembayaran yang disetujui</p>
          ${chart(paidTrx)}
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card-x">
          <h2>Status pembayaran</h2>
          <p class="text-muted small">Total ${trx.length} transaksi.</p>
          ${statusBreakdown}
        </div>
      </div>
    </div>
    <div class="card-x h-auto">
      <h2>Pembayaran terbaru</h2>
      ${table(['UMKM', 'Periode', 'Nominal', 'Status'], recentRows)}
      <a href="verifikasi-pembayaran.html" class="btn btn-outline-maroon btn-sm">Buka verifikasi</a>
    </div>`
  );
};

// --- DATA UMKM ---
PAGES['data-umkm'] = () => {
  render(
    'Data UMKM',
    'Kelola data UMKM, setujui pengajuan akun, dan atur status akun.',
    `
    <div class="card-x h-auto mb-3">
      <h2>Permintaan akun <span id="rc" class="badge text-bg-warning fw-normal"></span></h2>
      <div id="rq"></div>
    </div>

    <div class="card-x h-auto">
      <select id="fs" class="form-select w-auto mb-3">
        <option value="">Semua status</option>
        <option>Aktif</option>
        <option>Nonaktif</option>
      </select>
      <div id="tb"></div>
    </div>`,
    1
  );

  // --- Daftar UMKM: lihat detail, aktifkan atau nonaktifkan akun ---
  const renderTable = () => {
    const keyword = q.value.toLowerCase();
    const filtered = umkmData.filter(
      (u) =>
        u.role === 'user' &&
        (!fs.value || u.status === fs.value) &&
        `${u.nama}${u.pemilik}${u.jenis}`.toLowerCase().includes(keyword)
    );

    const rows = filtered
      .map(
        (u) => `
          <tr>
            <td>${u.nama}</td>
            <td>${u.pemilik}</td>
            <td>${u.jenis}</td>
            <td>${u.telp}</td>
            <td>${u.tgl}</td>
            <td>${bdg(u.status)}</td>
            <td class="text-nowrap">
              <button class="btn btn-sm btn-outline-secondary" onclick="dt('${u.id}')">Detail</button>
              ${
                u.status === 'Aktif'
                  ? `<button class="btn btn-sm btn-outline-danger" onclick="ubahStatus('${u.id}')">Nonaktifkan</button>`
                  : `<button class="btn btn-sm btn-maroon" onclick="ubahStatus('${u.id}')">Aktifkan</button>`
              }
            </td>
          </tr>`
      )
      .join('');

    tb.innerHTML = table(['Nama usaha', 'Pemilik', 'Jenis', 'Kontak', 'Terdaftar', 'Status', 'Aksi'], rows);
  };

  window.dt = (id) => {
    const u = umkmData.find((x) => x.id === id);
    if (!u) return;

    const details = [
      ['ID pengguna', u.id],
      ['Nama usaha', u.nama],
      ['Pemilik', u.pemilik],
      ['Jenis usaha', u.jenis],
      ['Telepon', u.telp],
      ['Omzet setahun', u.omzetTahun != null ? rp(u.omzetTahun) : '-'],
      ['Terdaftar', u.tgl],
      ['Status', bdg(u.status)],
    ]
      .map(([label, val]) => `<dt class="col-5 text-muted fw-normal">${label}</dt><dd class="col-7">${val}</dd>`)
      .join('');

    modal('Detail UMKM', `<dl class="row mb-0">${details}</dl>`);
  };

  // Aktifkan atau nonaktifkan akun (akun nonaktif tidak bisa login)
  window.ubahStatus = (id) => {
    const u = umkmData.find((x) => x.id === id);
    if (!u) return;

    u.status = u.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    save();
    renderTable();
    notify(`Akun ${u.nama} sekarang ${u.status.toLowerCase()}.`, u.status === 'Aktif' ? 'success' : 'warning');
  };

  // --- Permintaan akun dari halaman depan (Ajukan akun) ---
  const refreshBadge = (n) => {
    const el = document.querySelector('.sb nav a[href="data-umkm.html"] .nb');
    if (!el) return;
    if (n) el.textContent = n;
    else el.remove();
  };

  const renderRequests = () => {
    const pending = reqData.filter((r) => r.status === 'Menunggu');

    $('rc').textContent = pending.length;
    $('rc').classList.toggle('d-none', !pending.length);
    refreshBadge(pending.length);

    $('rq').innerHTML = pending.length
      ? table(
          ['Nama usaha', 'Pemilik', 'ID pengguna', 'Jenis', 'Telepon', 'Omzet/tahun', 'Diajukan', 'Aksi'],
          pending
            .map(
              (r) => `
              <tr>
                <td>${r.nama}</td>
                <td>${r.pemilik}</td>
                <td>${r.uid}</td>
                <td>${r.jenis}</td>
                <td>${r.telp}</td>
                <td>
                  ${r.omzetTahun != null ? rp(r.omzetTahun) : '-'}
                  ${r.bukti ? `<button class="btn btn-sm btn-link p-0 ms-1" onclick="lihatBukti(${r.id})">Bukti</button>` : ''}
                </td>
                <td>${r.tgl}</td>
                <td class="text-nowrap">
                  <button class="btn btn-sm btn-maroon" onclick="reqSetuju(${r.id})">Setujui</button>
                  <button class="btn btn-sm btn-outline-danger" onclick="reqTolak(${r.id})">Tolak</button>
                </td>
              </tr>`
            )
            .join('')
        )
      : '<p class="text-muted small mb-0">Tidak ada permintaan akun baru.</p>';
  };

  // Lihat bukti omzet tahunan yang diunggah saat pengajuan
  window.lihatBukti = (id) => {
    const r = reqData.find((x) => x.id === id);
    if (!r) return;

    modal(
      'Bukti omzet - ' + r.nama,
      `<p class="small text-muted mb-2">Omzet setahun: <b>${rp(r.omzetTahun)}</b> | File: ${r.bukti}</p>` +
        (r.img
          ? `<img src="${r.img}" class="img-fluid rounded border" alt="Bukti omzet">`
          : '<div class="text-muted small">Pratinjau tidak tersedia untuk file PDF.</div>')
    );
  };

  // Setujui: buat akun UMKM aktif dari data pengajuan, langsung muncul di tabel
  window.reqSetuju = (id) => {
    const r = reqData.find((x) => x.id === id);
    if (!r) return;

    if (umkmData.some((u) => u.id === r.uid)) {
      return notify('ID pengguna sudah terdaftar.', 'danger');
    }

    umkmData.push({
      id: r.uid,
      pw: r.pw,
      role: 'user',
      nama: r.nama,
      pemilik: r.pemilik,
      jenis: r.jenis,
      telp: r.telp,
      omzetTahun: r.omzetTahun,
      tgl: tgl(),
      status: 'Aktif',
    });

    r.status = 'Disetujui';
    save();
    renderRequests();
    renderTable();
    notify('Akun dibuat. UMKM sudah bisa login.');
  };

  window.reqTolak = (id) => {
    const r = reqData.find((x) => x.id === id);
    if (!r) return;

    r.status = 'Ditolak';
    save();
    renderRequests();
    notify('Pengajuan ditolak.', 'warning');
  };

  q.oninput = fs.onchange = renderTable;
  renderTable();
  renderRequests();
};

// --- VERIFIKASI PEMBAYARAN ---
PAGES['verifikasi-pembayaran'] = () => {
  let activeTab = STATUS_LIST[0];

  render(
    'Verifikasi Pembayaran',
    'Periksa bukti bayar, lalu setujui atau tolak.',
    `
    <div class="card-x">
      <div id="tabs" class="btn-group mb-3"></div>
      <div id="tb"></div>
    </div>`,
    1
  );

  const actionButtons = (id) => `
    <button class="btn btn-sm btn-maroon" onclick="sp(${id},'Lunas')">Setujui</button>
    <button class="btn btn-sm btn-outline-danger" onclick="sp(${id},'Ditolak')">Tolak</button>`;

  const renderView = () => {
    const keyword = q.value.toLowerCase();
    const allTrx = getTransactions();

    tabs.innerHTML = STATUS_LIST.map((status) => {
      const btnClass = status === activeTab ? 'btn-maroon' : 'btn-outline-secondary';
      const count = allTrx.filter((p) => p.status === status).length;
      return `<button class="btn btn-sm ${btnClass}" onclick="st('${status}')">${STATUS_LABELS[status]} (${count})</button>`;
    }).join('');

    const rows = allTrx
      .filter((p) => p.status === activeTab && `${getUmkmName(p.uid)}${fmtP(p.periode)}`.toLowerCase().includes(keyword))
      .map(
        (p) => `
          <tr>
            <td>${getUmkmName(p.uid)}</td>
            <td>${fmtP(p.periode)}</td>
            <td>${rp(p.nominal)}</td>
            <td>${p.metode}</td>
            <td><a href="#" onclick="dv(${p.id});return false">${p.bukti}</a></td>
            <td class="text-nowrap">${activeTab === STATUS_LIST[0] ? actionButtons(p.id) : '-'}</td>
          </tr>`
      )
      .join('');

    tb.innerHTML = table(['UMKM', 'Periode', 'Nominal', 'Metode', 'Bukti', 'Aksi'], rows);
  };

  window.st = (status) => {
    activeTab = status;
    renderView();
  };

  window.dv = (id) => {
    const item = paymentData.find((p) => p.id === id);
    const footerActions =
      item?.status === STATUS_LIST[0]
        ? `<div class="d-flex gap-2 mt-3">${actionButtons(id).replace(/btn-sm/g, '')}</div>`
        : '';
    detail(id, footerActions);
  };

  window.sp = (id, status) => {
    const item = paymentData.find((p) => p.id === id);
    if (!item) return;

    item.status = status;
    save();

    const modalEl = $('mdl');
    if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();

    renderView();
    notify(status === 'Lunas' ? 'Pembayaran disetujui.' : 'Pembayaran ditolak.');
  };

  q.oninput = renderView;
  renderView();
};

// --- LAPORAN KEUANGAN ---
PAGES['laporan-keuangan'] = () => {
  let rows = [];

  render(
    'Laporan Keuangan',
    'Rekap pajak terkumpul dan ekspor ke PDF.',
    `
    <div class="card-x mb-3 h-auto">
      <div class="d-flex flex-wrap gap-2 align-items-end">
        <div>
          <label class="small">Dari periode</label>
          <input type="month" id="d1" class="form-control" value="2026-05">
        </div>
        <div>
          <label class="small">Sampai periode</label>
          <input type="month" id="d2" class="form-control" value="2026-10">
        </div>
        <button id="ap" class="btn btn-outline-maroon">Terapkan</button>
        <button id="ex" class="btn btn-maroon ms-auto">
          <i class="bi bi-download"></i> Ekspor PDF
        </button>
      </div>
      <div id="err" class="text-danger small mt-2"></div>
    </div>
    <div class="card-x h-auto">
      <h2>Rekapitulasi per periode</h2>
      <div id="tb"></div>
    </div>`
  );

  const renderReport = () => {
    err.textContent = '';

    if (!d1.value || !d2.value) {
      err.textContent = 'Pilih periode awal dan akhir.';
      return;
    }
    if (d1.value > d2.value) {
      err.textContent = 'Periode awal tidak boleh melebihi periode akhir.';
      return;
    }

    const grouped = {};
    getTransactions()
      .filter((p) => p.periode >= d1.value && p.periode <= d2.value)
      .forEach((p) => {
        const entry = (grouped[p.periode] ??= { p: p.periode, n: 0, ok: 0, tot: 0 });
        entry.n++;
        if (p.status === 'Lunas') {
          entry.ok++;
          entry.tot += p.nominal;
        }
      });

    rows = Object.values(grouped).sort((a, b) => b.p.localeCompare(a.p));

    const tableRows = rows
      .map(
        (r) => `
          <tr>
            <td>${fmtP(r.p)}</td>
            <td>${r.n}</td>
            <td>${r.ok}</td>
            <td class="fw-bold">${rp(r.tot)}</td>
          </tr>`
      )
      .join('');

    tb.innerHTML = table(['Periode', 'Transaksi', 'Disetujui', 'Total pajak'], tableRows);
  };

  ap.onclick = renderReport;
  renderReport();

  ex.onclick = () => {
    if (!rows.length) {
      notify('Tidak ada data untuk diekspor.', 'warning');
      return;
    }
    pdf(
      `Laporan Keuangan PajakIn ${d1.value} s/d ${d2.value}`,
      ['Periode', 'Transaksi', 'Disetujui', 'Total pajak'],
      rows.map((r) => [fmtP(r.p), r.n, r.ok, rp(r.tot)]),
      'laporan-keuangan.pdf'
    );
  };
};

// --- TARIF PAJAK ---
PAGES['tarif-pajak'] = () => {
  const formConfig = [
    ['rate', 'Tarif PPh Final (%)', 'number', taxRate.rate],
    ['amb', 'Ambang omzet tahunan (Rp)', 'number', taxRate.ambang],
    ['dsr', 'Dasar aturan', 'text', taxRate.dasar],
  ];

  const formHtml = formConfig
    .map(
      ([id, label, type, val]) => `
        <label class="form-label small mb-1">${label}</label>
        <input id="t_${id}" type="${type}" step="any" value="${val}" class="form-control mb-3">`
    )
    .join('');

  render(
    'Tarif Pajak',
    'Atur tarif dan ambang omzet perhitungan pajak.',
    `
    <div class="row g-3">
      <div class="col-lg-6">
        <div class="card-x">
          <h2>Pengaturan tarif pajak</h2>
          ${formHtml}
          <div id="err" class="text-danger small mb-2"></div>
          <button id="sv" class="btn btn-maroon">Simpan perubahan</button>
          <button id="bt" class="btn btn-light">Batal</button>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card-x">
          <h2>Simulasi dampak</h2>
          <p class="small text-muted">Omzet bulanan Rp 18.000.000</p>
          <div class="hl"><small>Pajak terutang user</small><strong id="sm"></strong></div>
          <div class="alert alert-warning small mb-0">
            Periksa kembali aturan pajak terbaru sebelum mengubah tarif. Perubahan memengaruhi semua perhitungan berikutnya.
          </div>
        </div>
      </div>
    </div>`
  );

  const updateSimulation = () => {
    const rate = +t_rate.value || 0;
    sm.textContent = rp(Math.round((18e6 * rate) / 100));
  };

  t_rate.oninput = updateSimulation;
  updateSimulation();

  sv.onclick = () => {
    const rate = +t_rate.value;
    const ambang = +t_amb.value;
    const dasar = t_dsr.value.trim();

    if (!t_rate.value || !t_amb.value || !dasar) {
      err.textContent = 'Semua kolom wajib diisi.';
      return;
    }
    if (rate <= 0 || rate > 100) {
      err.textContent = 'Tarif harus lebih dari 0 dan maksimal 100.';
      return;
    }
    if (ambang < 0) {
      err.textContent = 'Ambang omzet tidak boleh negatif.';
      return;
    }

    Object.assign(taxRate, { rate, ambang, dasar });
    save();
    err.textContent = '';
    notify('Tarif pajak disimpan.');
  };

  bt.onclick = () => PAGES['tarif-pajak']();
};

PAGES[document.body.dataset.page]?.();
