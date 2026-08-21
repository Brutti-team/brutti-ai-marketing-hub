function clean(value = '') {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function subjectFor(form = {}) {
  if (form.product && form.product !== 'General / No Product') return clean(form.product)
  return clean(form.title) || 'benda ni'
}

function replacementFor(line, form, mode) {
  const subject = subjectFor(form)
  const professional = mode === 'professional' || form.tone === 'Professional but friendly'

  if (/^Biar .+ senang faham kenapa .+ ni penting, tanpa explain berlebihan\.?$/i.test(line)) {
    return professional
      ? `Bila keperluan sebenar jelas, lebih mudah menilai sama ada ${subject} benar-benar sesuai.`
      : `Kalau keperluan kamu memang dekat dengan situasi ni, senang juga mau nampak sama ada ${subject} betul-betul ngam atau tidak.`
  }
  if (/^Orang yang baca patut boleh nampak .+ bukan setakat nampak nama produk\.?$/i.test(line)) {
    return professional
      ? `Nilai ${subject} lebih mudah dilihat apabila dibandingkan dengan keperluan sebenar.`
      : `Kalau tengah compare pilihan, tengok dulu ${subject} ni betul-betul ngam dengan keperluan kamu ka tidak.`
  }
  if (/^Untuk orang yang baca, soalan paling berguna ialah/i.test(line)) {
    return professional
      ? `Yang utama ialah melihat bagaimana ${subject} sesuai dengan penggunaan sebenar.`
      : `Yang paling senang dijadikan ukuran: macam mana ${subject} ni masuk dalam penggunaan harian sebenar.`
  }
  if (/^Kasi jelas dulu kenapa benda ni relevan untuk orang yang baca/i.test(line)) {
    return professional
      ? 'Bila kesesuaian sudah jelas, barulah langkah seterusnya lebih mudah dinilai.'
      : 'Kalau detail dia ngam dengan situasi kamu, barula senang mau fikir next step.'
  }
  if (/^Bahagian human tu mesti datang dari konteks sebenar/i.test(line)) {
    return professional
      ? 'Kadang-kadang detail kecil daripada situasi sebenar memberi konteks yang paling bermakna.'
      : 'Kadang detail kecil dari situasi sebenar tu la yang bikin satu cerita lebih hidup.'
  }
  if (/^Bagi orang satu sebab yang jelas untuk react/i.test(line)) {
    return 'Kalau situasi ni dekat dengan pengalaman kamu, mesti ada satu part yang terus rasa familiar.'
  }
  if (/^Kasi dekat soalan tadi dengan detail sebenar/i.test(line)) {
    return 'Bila detail sebenar sudah jelas, senang juga mau compare dengan apa yang kamu perlukan.'
  }
  if (/^Tidak payah explain sampai berat sangat/i.test(line)) {
    return 'Senang cerita, tengok fungsi yang memang penting untuk keperluan kamu dulu.'
  }
  if (/^Santai boleh, tapi fakta jangan kasi longgar\.?$/i.test(line)) {
    return 'Yang penting, detail yang kamu compare tu memang benda yang sudah confirm.'
  }
  if (/^Mesej dikekalkan ringkas, berasaskan fakta/i.test(line)) {
    return 'Bila fakta jelas, lebih mudah menilai sama ada pilihan ini benar-benar sesuai dengan keperluan.'
  }
  if (/^Elakkan claim berlebihan/i.test(line)) {
    return 'Sebab itu, setiap keputusan patut berpandukan detail yang telah disahkan.'
  }
  if (/^Mula dari fungsi dan detail produk yang sudah confirm dulu/i.test(line)) {
    return professional
      ? `Jika fungsi dan detail ${subject} sepadan dengan keperluan, barulah pilihan ini lebih mudah dinilai.`
      : `Kalau fungsi dan detail ${subject} ngam dengan apa yang kamu perlukan, barula senang mau nilai pilihan ni.`
  }
  if (/^Guna sudut pandang Brutti yang sebenar/i.test(line)) {
    return 'Bagi Brutti, cerita yang paling kuat tetap datang dari situasi sebenar, bukan ayat marketing semata-mata.'
  }
  if (/^Tip tu mesti cukup specific/i.test(line)) {
    return 'Kalau tip ni kena dengan situasi kamu, boleh cuba apply ikut keadaan sendiri.'
  }
  if (/^Tunjuk proses dan orang sebenar/i.test(line)) {
    return 'Yang best pasal behind the scenes, kita boleh nampak proses sebenar satu-satu — bukan hasil akhir ja.'
  }
  if (/^Keperluan sebenar customer tetap jadi pusat cerita ni\.?$/i.test(line)) {
    return 'Bila keperluan customer sudah jelas, barula cerita solution tu betul-betul masuk akal.'
  }
  if (/^Kasi jelas dulu kenapa benda ni relevan/i.test(line)) {
    return 'Kalau benda ni memang dekat dengan keperluan kamu, barula next step rasa lebih jelas.'
  }

  if (professional) {
    return line
      .replace(/^Kalau ada satu benda mahu ingat, yang ni la:/i, 'Perkara utama yang perlu diingat ialah:')
      .replace(/^Yang paling penting, macam mana/i, 'Yang utama ialah bagaimana')
      .replace(/^Kalau mahu tahu lebih lanjut, mesej sahaja team Brutti dan kita check detail yang sudah confirm sama-sama\.?$/i, 'Untuk maklumat lanjut, hubungi team Brutti untuk semak detail yang telah disahkan.')
  }

  return line
}

export function polishContentStudioCaption(caption, form = {}, mode = 'balanced') {
  return String(caption || '')
    .split('\n')
    .map((line) => clean(line))
    .filter(Boolean)
    .map((line) => replacementFor(line, form, mode))
    .join('\n')
}
