# Cara kemas kini Apps Script (URL jangan berubah)

Laman web baru akan hantar workspace key bersama permintaan Meta insights. Script yang **sedang hidup sekarang** akan abaikan key tu, jadi laman web tetap jalan. Script **baru** pula akan minta key tu, dan tak lagi hantar status token.

Sebab itu, buat langkah di bawah **selepas** laman web dah hidup. Maksudnya: PR ni dah di-merge, dan deploy GitHub Pages dah hijau. Kalau script dikemas kini dulu, senarai post Analytics akan rosak sekejap, sebab laman web lama belum hantar key.

## 1. Buka projek Apps Script yang memang dah ada

Jangan buat projek baru. Buka projek backend yang sedang digunakan sekarang.

## 2. Ganti Code.gs

1. Dalam editor, buka fail `Code.gs`.
2. Pilih semua teks lama dan padam.
3. Copy **keseluruhan** fail `apps-script/Code.gs` dari repo ni, paste, kemudian Save.
4. Fail `WorkflowDataStability.gs` dan `appsscript.json` tak perlu disentuh untuk kemas kini ni.

## 3. Semak Script Property

Nilai key jangan ditulis dalam GitHub, chat, screenshot, atau fail ni.

1. Pergi **Project Settings** (ikon gear) → **Script Properties**.
2. Cari property bernama `WORKSPACE_KEY`.
3. Kalau nama tu dah ada, **jangan ubah nilainya**. Itu key yang sama kau taip dalam Settings laman web.
4. Kalau nama tu tiada, tekan Add script property.
   - Nama: `WORKSPACE_KEY`
   - Nilai: key yang sama yang staff taip dalam Settings
5. Tiada property baru yang perlu ditambah.

## 4. Redeploy sebagai versi baru, pada deployment yang sama

URL web app mesti kekal sama.

1. Klik **Deploy** → **Manage deployments**.
2. Pada web app yang sedang hidup, klik ikon pensel (Edit). Jangan klik New deployment.
3. Kat **Version**, pilih **New version**.
4. Execute as kekal **Me**. Who has access kekal **Anyone**.
5. Klik **Deploy**.
6. URL mesti masih sama macam yang lama, dan masih berakhir dengan `/exec`.

## 5. Uji sebentar

1. Buka laman web. Pergi Settings. Kalau belum connect, masukkan workspace key macam biasa. Pada komputer sendiri, boleh tick Remember this device.
2. Buka Analytics. Senarai post patut masih keluar. Buka satu post. Panel tepi patut ada ringkasan prestasi dan cadangan langkah seterusnya.
3. Buka tab baru. Tampal URL web app, dan tambah di hujung sahaja: `?view=meta-insights`. Jangan letak key. Kau patut nampak mesej error pasal workspace key. Kau tak patut nampak senarai post, caption, atau apa-apa pasal token.
4. Pada Dashboard, Today's Recommendation patut masih ada kalau key dah disimpan.

Kalau langkah 2 gagal, tapi langkah 3 masih nampak data post, deployment lama masih yang hidup. Ulang langkah 4 dan pastikan yang dipilih ialah New version pada deployment yang sama.
