
guard('user');

const U = me(),
    mine = () => paymentData.filter(p => p.uid === U.id),
    P = {};

const ST = ['Menunggu Verifikasi', 'Lunas', 'Ditolak'];

P.dashboard = () => {
    const my = mine(),
        tg = my.find(p => p.status === 'Belum Bayar'),
        cnt = s => my.filter(p => p.status === s).length,
        lunas = my.filter(p => p.status === 'Lunas')
            .reduce((a, p) => a + p.nominal, 0);

    render(
        'Halo, ' + U.nama,
        'Ringkasan pajak usahamu bulan ini.',
        `
        <div class="row g-3 mb-3">
            ${stat('wallet2', 'Omzet bulan ini', rp(tg ? tg.omzet : 0), tg ? fmtP(tg.periode) : 'Belum ada tagihan')}
            ${stat('percent', 'Pajak terutang', rp(tg ? tg.nominal : 0), 'Tarif ' + taxRate.rate + '% dari omzet')}
            ${stat('clock', 'Status pembayaran', tg ? 'Belum bayar' : 'Tidak ada tagihan', tg ? 'Tagihan ' + fmtP(tg.periode) : 'Semua tagihan terproses')}
        </div>

        <div class="row g-3 mb-3">
            <div class="col-lg-8">
                <div class="card-x">
                    <h2>Pajak per bulan</h2>
                    <p class="small text-muted mb-1">6 bulan terakhir, termasuk tagihan aktif</p>
                    ${chart(my)}
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card-x">
                    <h2>Rekap pembayaran</h2>

                    <div class="rk">
                        <span>Total terbayar</span>
                        <b>${rp(lunas)}</b>
                    </div>

                    <div class="rk">
                        <span>Lunas</span>
                        <b>${cnt('Lunas')}</b>
                    </div>

                    <div class="rk">
                        <span>Menunggu verifikasi</span>
                        <b>${cnt('Menunggu Verifikasi')}</b>
                    </div>

                    <div class="rk">
                        <span>Ditolak</span>
                        <b>${cnt('Ditolak')}</b>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-3">
            <div class="col-lg-8">
                <div class="card-x">
                    <h2>Transaksi terbaru</h2>

                    ${table(
                        ['Periode', 'Nominal', 'Tanggal', 'Status'],
                        my.filter(p => p.status !== 'Belum Bayar')
                            .slice(0, 5)
                            .map(p => `
                                <tr>
                                    <td>${fmtP(p.periode)}</td>
                                    <td>${rp(p.nominal)}</td>
                                    <td>${p.tanggal}</td>
                                    <td>${bdg(p.status)}</td>
                                </tr>
                            `)
                    )}

                    <a class="btn btn-outline-maroon btn-sm" href="riwayat-pembayaran.html">
                        Lihat semua riwayat
                    </a>
                </div>
            </div>

            <div class="col-lg-4">
                <div class="card-x">
                    <h2>Tagihan aktif</h2>

                    <div class="hl">
                        <small>Pajak terutang ${tg ? fmtP(tg.periode) : ''}</small>
                        <strong>${rp(tg ? tg.nominal : 0)}</strong>
                    </div>

                    <div class="d-flex justify-content-between small mb-3">
                        <span>Tarif aktif</span>
                        <b>${taxRate.rate}%</b>
                    </div>

                    <a href="bayar-pajak.html" class="btn btn-maroon w-100 mb-2">
                        Bayar sekarang
                    </a>

                    <a href="hitung-pajak.html" class="btn btn-outline-secondary w-100">
                        Hitung ulang pajak
                    </a>
                </div>
            </div>
        </div>
        `
    );
};

P['hitung-pajak'] = () => {
    render(
        'Hitung Pajak',
        'Estimasi pajak dari omzet bulanan.',
        `
        <div class="row g-3">
            <div class="col-lg-5">
                <div class="card-x">
                    <h2>Hitung pajak</h2>

                    <label class="form-label">Periode</label>
                    <input type="month" id="per" class="form-control mb-3" value="2026-10">

                    <label class="form-label">Omzet bulanan (Rp)</label>
                    <input type="number" id="om" class="form-control mb-3" placeholder="18000000">

                    <div id="err" class="text-danger small mb-2"></div>

                    <button id="hit" class="btn btn-maroon">
                        Hitung pajak
                    </button>

                    <button id="rst" class="btn btn-light">
                        Reset
                    </button>
                </div>
            </div>

            <div class="col-lg-7">
                <div class="card-x" id="hs"></div>
            </div>
        </div>
        `
    );

    const kosong = () => {
        hs.innerHTML = `
            <h2>Hasil perhitungan</h2>
            <p class="text-muted">
                Isi periode dan omzet, lalu tekan Hitung pajak.
            </p>
        `;
    };

    kosong();

    hit.onclick = () => {
        const o = +om.value;

        err.textContent = '';

        if (!per.value || om.value === '') {
            return err.textContent = 'Periode dan omzet wajib diisi.';
        }

        if (o < 0) {
            return err.textContent = 'Omzet tidak boleh negatif.';
        }

        const r = {
            periode: per.value,
            omzet: o,
            nominal: Math.round(o * taxRate.rate / 100)
        };

        hs.innerHTML = `
            <h2>Hasil perhitungan</h2>

            <div class="hl">
                <small>Pajak terutang ${fmtP(r.periode)}</small>
                <strong>${rp(r.nominal)}</strong>
            </div>

            ${[
                ['Omzet bulanan', rp(o)],
                ['Tarif PPh Final', taxRate.rate + '%'],
                ['Ambang omzet tahunan (diatur admin)', rp(taxRate.ambang)],
                ['Dasar aturan', taxRate.dasar]
            ].map(([a, b]) => `
                <div class="d-flex justify-content-between small py-1">
                    <span>${a}</span>
                    <b>${b}</b>
                </div>
            `).join('')}

            ${o * 12 > taxRate.batas ? `
                <div class="alert alert-warning small mt-2 mb-0">
                    Estimasi omzet tahunan melebihi batas skema PPh Final (${rp(taxRate.batas)}).
                </div>
            ` : ''}

            <button id="lnj" class="btn btn-maroon w-100 mt-3">
                Lanjut ke pembayaran
            </button>
        `;

        lnj.onclick = () => {
            const p = mine().find(x => x.periode === r.periode);

            if (p && ['Lunas', 'Menunggu Verifikasi'].includes(p.status)) {
                return notify('Periode ini sudah diajukan atau lunas.', 'warning');
            }

            if (p) {
                Object.assign(p, r, { status: 'Belum Bayar' });
            } else {
                paymentData.push({
                    id: Date.now(),
                    uid: U.id,
                    ...r,
                    tanggal: '-',
                    metode: '-',
                    bukti: '',
                    status: 'Belum Bayar'
                });
            }

            save();
            location.href = 'bayar-pajak.html';
        };
    };

    rst.onclick = () => {
        om.value = '';
        err.textContent = '';
        kosong();
    };
};

P['bayar-pajak'] = () => {
    const ts = mine().filter(p =>
        ['Belum Bayar', 'Ditolak'].includes(p.status)
    );

    render(
        'Bayar Pajak',
        'Pilih tagihan, metode, dan unggah bukti pembayaran.',
        `
        <div class="card-x" style="max-width:640px">

            <label class="form-label">Tagihan</label>

            <select id="tg" class="form-select mb-3">
                ${ts.map(p => `
                    <option value="${p.id}">
                        ${fmtP(p.periode)} - ${rp(p.nominal)} (${p.status})
                    </option>
                `).join('') || '<option value="">Tidak ada tagihan</option>'}
            </select>

            <label class="form-label">Metode pembayaran (simulasi)</label>

            ${[
                ['Transfer bank', 'Transfer ke rekening penerima pajak'],
                ['QRIS', 'Pindai kode QR dari aplikasi pembayaran'],
                ['E-wallet', 'Bayar lewat dompet digital']
            ].map(([m, d], i) => `
                <label class="pay mb-2">
                    <input type="radio" name="mt" value="${m}" ${i ? '' : 'checked'}>
                    <b>${m}</b><br>
                    <small class="text-muted">${d}</small>
                </label>
            `).join('')}

            <label class="form-label mt-3">
                Bukti pembayaran (JPG, PNG, atau PDF)
            </label>

            <input type="file" id="bk" class="form-control mb-2" accept=".jpg,.jpeg,.png,.pdf">

            <img
                id="pv"
                class="img-fluid rounded border mb-2 d-none"
                style="max-height:220px"
                alt="Pratinjau bukti"
            >

            <div id="err" class="text-danger small mb-2"></div>

            <button id="aj" class="btn btn-maroon">
                Ajukan pembayaran
            </button>

            <a href="dashboard.html" class="btn btn-light">
                Batal
            </a>

        </div>
        `
    );

    bk.onchange = () => {
        const f = bk.files[0],
            ok = f && f.type.startsWith('image/');

        pv.classList.toggle('d-none', !ok);

        if (ok) {
            pv.src = URL.createObjectURL(f);
        }
    };

    aj.onclick = async () => {
        const p = paymentData.find(x => x.id == tg.value),
            f = bk.files[0];

        if (!p) {
            return err.textContent = 'Belum ada tagihan. Hitung pajak terlebih dahulu.';
        }

        if (!f) {
            return err.textContent = 'Pilih bukti pembayaran sebelum mengajukan.';
        }

        if (!/\.(jpe?g|png|pdf)$/i.test(f.name)) {
            return err.textContent = 'Format bukti harus JPG, PNG, atau PDF.';
        }

        if (f.size > 5 * 1024 * 1024) {
            return err.textContent = 'Ukuran bukti maksimal 5 MB.';
        }

        err.textContent = '';

        Object.assign(p, {
            img: await readImg(f),
            metode: document.querySelector('[name=mt]:checked').value,
            bukti: f.name,
            tanggal: tgl(),
            status: 'Menunggu Verifikasi'
        });

        save();
        notify('Pembayaran diajukan.');

        setTimeout(() => location.href = 'riwayat-pembayaran.html', 900);
    };
};

P['riwayat-pembayaran'] = () => {
    render(
        'Riwayat Pembayaran',
        'Arsip digital pembayaran pajak usahamu.',
        `
        <div class="card-x">

            <div class="d-flex flex-wrap gap-2 mb-3">

                <select id="fs" class="form-select w-auto">
                    <option value="">Semua status</option>
                    ${ST.map(s => `<option>${s}</option>`).join('')}
                </select>

                <button id="pd" class="btn btn-outline-maroon ms-auto">
                    <i class="bi bi-printer"></i> Cetak PDF
                </button>

            </div>

            <div id="tb"></div>

        </div>
        `,
        1
    );

    let rows = [];

    const draw = () => {
        const k = q.value.toLowerCase();

        rows = mine().filter(p =>
            p.status !== 'Belum Bayar' &&
            (!fs.value || p.status === fs.value) &&
            (fmtP(p.periode) + p.status).toLowerCase().includes(k)
        );

        tb.innerHTML = table(
            ['Periode', 'Omzet', 'Pajak', 'Tanggal bayar', 'Status', 'Aksi'],
            rows.map(p => `
                <tr>
                    <td>${fmtP(p.periode)}</td>
                    <td>${rp(p.omzet)}</td>
                    <td>${rp(p.nominal)}</td>
                    <td>${p.tanggal}</td>
                    <td>${bdg(p.status)}</td>

                    <td class="text-nowrap">
                        <button
                            class="btn btn-sm btn-outline-secondary"
                            onclick="detail(${p.id})"
                        >
                            Detail
                        </button>

                        ${p.status === 'Ditolak' ? `
                            <a class="btn btn-sm btn-maroon" href="bayar-pajak.html">
                                Unggah ulang
                            </a>
                        ` : ''}
                    </td>
                </tr>
            `)
        );
    };

    q.oninput = fs.onchange = draw;

    draw();

    pd.onclick = () => rows.length
        ? pdf(
            'Riwayat Pembayaran - ' + U.nama,
            ['Periode', 'Pajak', 'Tanggal', 'Status'],
            rows.map(p => [
                fmtP(p.periode),
                rp(p.nominal),
                p.tanggal,
                p.status
            ]),
            'riwayat-pajakin.pdf'
        )
        : notify('Tidak ada data untuk dicetak.', 'warning');
};

P[document.body.dataset.page]();
