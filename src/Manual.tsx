type Lang = 'bm' | 'en'

interface ManualProps {
  lang: Lang
  onBackToPlaybook: () => void
}

export default function Manual({ lang, onBackToPlaybook }: ManualProps) {
  const t = (en: string, bm: string) => (lang === 'bm' ? bm : en)

  const sections = [
    {
      id: 'principles',
      titleEn: 'Guiding Principles',
      titleBm: 'Prinsip Panduan',
      contentEn: [
        'Protect human safety and welfare as the first priority.',
        'Comply fully with applicable disclosure and regulatory obligations.',
        'Communicate with accuracy, consistency, and appropriate speed.',
        'Treat Bahasa Malaysia as a primary working language alongside English.',
        'Demonstrate respect for cultural, community, and regional sensitivities.',
        'Maintain clear accountability and an auditable decision trail.',
        'Avoid speculation, unapproved commentary, and premature public statements.',
      ],
      contentBm: [
        'Lindungi keselamatan dan kesejahteraan manusia sebagai keutamaan pertama.',
        'Patuhi sepenuhnya kewajipan pendedahan dan peraturan yang berkenaan.',
        'Berkomunikasi dengan ketepatan, konsistensi dan kelajuan yang sesuai.',
        'Anggap Bahasa Malaysia sebagai bahasa kerja utama bersama Bahasa Inggeris.',
        'Tunjukkan penghormatan terhadap sensitiviti budaya, komuniti dan serantau.',
        'Kekalkan akauntabiliti yang jelas dan jejak keputusan yang boleh diaudit.',
        'Elakkan spekulasi, komen tidak diluluskan, dan kenyataan awam pramatang.',
      ],
    },
    {
      id: 'roles',
      titleEn: 'Core Crisis Team Roles',
      titleBm: 'Peranan Pasukan Krisis Teras',
      contentEn: [
        'Crisis Lead — Overall coordination and operational decision-making.',
        'Company Secretary — Disclosure assessment, Board liaison, regulatory compliance.',
        'Corporate Communications Lead — Messaging, media handling, stakeholder communication.',
        'Legal / External Counsel — Legal risk assessment and statement review.',
        'Operational Lead — Provision of verified facts from the affected area.',
        'Investor Relations — Shareholder and analyst communication when required.',
      ],
      contentBm: [
        'Ketua Krisis — Penyelarasan keseluruhan dan pembuatan keputusan operasi.',
        'Setiausaha Syarikat — Penilaian pendedahan, perhubungan Lembaga, pematuhan peraturan.',
        'Ketua Komunikasi Korporat — Pemesejan, pengendalian media, komunikasi pihak berkepentingan.',
        'Undang-undang / Penasihat Luar — Penilaian risiko undang-undang dan semakan kenyataan.',
        'Ketua Operasi — Penyediaan fakta yang disahkan dari kawasan terjejas.',
        'Perhubungan Pelabur — Komunikasi dengan pemegang saham dan penganalisis apabila diperlukan.',
      ],
    },
    {
      id: 'first60',
      titleEn: 'First Sixty Minutes – Key Sequence',
      titleBm: 'Enam Puluh Minit Pertama – Urutan Utama',
      contentEn: [
        '1. Confirm the facts and the reliability of the source.',
        '2. Assess severity using the Level 1–4 matrix.',
        '3. Notify the Crisis Lead and Company Secretary immediately.',
        '4. Determine whether a Bursa announcement is required or likely.',
        '5. Prepare and obtain clearance for an initial holding statement.',
        '6. Align all potential spokespeople; instruct others not to comment.',
        '7. Activate media and social media monitoring.',
        '8. Document key decisions, timings, and approvals.',
      ],
      contentBm: [
        '1. Sahkan fakta dan kebolehpercayaan sumber.',
        '2. Nilai tahap keterukan menggunakan matriks Tahap 1–4.',
        '3. Maklumkan Ketua Krisis dan Setiausaha Syarikat dengan segera.',
        '4. Tentukan sama ada pengumuman Bursa diperlukan atau berkemungkinan.',
        '5. Sediakan dan dapatkan kelulusan untuk kenyataan awal.',
        '6. Selaraskan semua jurucakap berpotensi; arahkan yang lain supaya tidak memberi komen.',
        '7. Aktifkan pemantauan media dan media sosial.',
        '8. Dokumentasikan keputusan utama, masa, dan kelulusan.',
      ],
    },
    {
      id: 'stakeholders',
      titleEn: 'Stakeholder Communication Priorities',
      titleBm: 'Keutamaan Komunikasi Pihak Berkepentingan',
      contentEn: [
        '1. Safety of individuals — always first.',
        '2. Board and senior management.',
        '3. Regulators (Bursa Malaysia and any relevant sectoral regulators).',
        '4. Employees.',
        '5. Major shareholders and critical business partners.',
        '6. Media and the wider public.',
        '7. Community and local stakeholders.',
        '8. Other external parties.',
        'Sequence deliberately. Premature public statements can complicate regulatory or legal positions.',
      ],
      contentBm: [
        '1. Keselamatan individu — sentiasa dahulu.',
        '2. Lembaga Pengarah dan pengurusan kanan.',
        '3. Pengawal selia (Bursa Malaysia dan pengawal selia sektor yang berkaitan).',
        '4. Kakitangan.',
        '5. Pemegang saham utama dan rakan niaga kritikal.',
        '6. Media dan orang ramai.',
        '7. Komuniti dan pihak berkepentingan tempatan.',
        '8. Pihak luar yang lain.',
        'Susunan mesti disengajakan. Kenyataan awam pramatang boleh merumitkan kedudukan peraturan atau undang-undang.',
      ],
    },
    {
      id: 'media',
      titleEn: 'Media and Digital Protocols',
      titleBm: 'Protokol Media dan Digital',
      contentEn: [
        'Only pre-designated spokespeople may speak to the media.',
        'All external statements require clearance through the defined process.',
        'Official corporate channels should either remain silent or publish only approved holding language.',
        'Social media monitoring must be activated at the earliest opportunity.',
        'Employees should be instructed not to comment on the crisis on personal accounts.',
        'Any correction of inaccurate reporting must be factual, measured, and approved.',
        'Do not engage in speculative or defensive exchanges on social media during the acute phase.',
      ],
      contentBm: [
        'Hanya jurucakap yang telah ditetapkan boleh bercakap dengan media.',
        'Semua kenyataan luaran memerlukan kelulusan melalui proses yang ditetapkan.',
        'Saluran rasmi syarikat harus sama ada kekal senyap atau hanya menerbitkan bahasa kenyataan awal yang diluluskan.',
        'Pemantauan media sosial mesti diaktifkan seawal yang mungkin.',
        'Kakitangan harus diarahkan supaya tidak memberi komen mengenai krisis di akaun peribadi.',
        'Sebarang pembetulan laporan tidak tepat mesti berasaskan fakta, bersederhana, dan diluluskan.',
        'Jangan terlibat dalam pertukaran spekulatif atau defensif di media sosial semasa fasa akut.',
      ],
    },
    {
      id: 'bm-guidance',
      titleEn: 'Bahasa Malaysia Guidance',
      titleBm: 'Panduan Bahasa Malaysia',
      contentEn: [
        'Prefer clear, direct sentence structures over overly elaborate formal constructions.',
        'Maintain consistent terminology across all documents.',
        'Avoid literal translations from English that sound unnatural in Bahasa Malaysia.',
        'Ensure the BM version of any dual-language document carries equal weight.',
        'When addressing community or state-level stakeholders, demonstrate awareness of local hierarchy and protocol.',
        'Language relating to race, religion or royalty requires extreme care and senior/legal clearance.',
      ],
      contentBm: [
        'Utamakan struktur ayat yang jelas dan langsung berbanding binaan formal yang terlalu rumit.',
        'Kekalkan istilah yang konsisten merentas semua dokumen.',
        'Elakkan terjemahan harfiah dari Bahasa Inggeris yang kedengaran tidak semula jadi dalam Bahasa Malaysia.',
        'Pastikan versi BM mana-mana dokumen dwibahasa membawa berat yang sama.',
        'Apabila berurusan dengan pihak berkepentingan komuniti atau negeri, tunjukkan kesedaran tentang hierarki dan protokol tempatan.',
        'Bahasa berkaitan kaum, agama atau diraja memerlukan penjagaan ekstrem dan kelulusan kanan/undang-undang.',
      ],
    },
    {
      id: 'east-msia',
      titleEn: 'East Malaysia Considerations',
      titleBm: 'Pertimbangan Malaysia Timur',
      contentEn: [
        'Recognise distinct community, land, historical and political sensitivities in Sabah and Sarawak.',
        'Engage early with recognised local leaders and relevant state authorities.',
        'Use language that acknowledges local context without generalising or appearing dismissive.',
        'Coordinate carefully when federal and state perspectives may differ.',
        'Document all community and state-level engagement thoroughly.',
      ],
      contentBm: [
        'Kenali sensitiviti komuniti, tanah, sejarah dan politik yang berbeza di Sabah dan Sarawak.',
        'Libatkan diri awal dengan pemimpin tempatan yang diiktiraf dan pihak berkuasa negeri yang berkaitan.',
        'Gunakan bahasa yang mengakui konteks tempatan tanpa membuat generalisasi atau kelihatan memandang rendah.',
        'Selaraskan dengan teliti apabila perspektif persekutuan dan negeri mungkin berbeza.',
        'Dokumentasikan semua penglibatan komuniti dan peringkat negeri dengan teliti.',
      ],
    },
    {
      id: 'post-crisis',
      titleEn: 'Post-Crisis Review and Recovery',
      titleBm: 'Semakan dan Pemulihan Pasca-Krisis',
      contentEn: [
        'Conduct a structured debrief with the core crisis team.',
        'Evaluate the effectiveness of communication decisions, timing, and language used.',
        'Identify gaps in templates, processes, or training.',
        'Update the Playbook and Manual as required.',
        'Support affected employees and stakeholders appropriately.',
        'Focus on rebuilding trust through consistent and transparent follow-through.',
      ],
      contentBm: [
        'Jalankan taklimat berstruktur dengan pasukan krisis teras.',
        'Nilai keberkesanan keputusan komunikasi, masa, dan bahasa yang digunakan.',
        'Kenal pasti jurang dalam templat, proses, atau latihan.',
        'Kemas kini Playbook dan Manual seperti yang diperlukan.',
        'Sokong kakitangan dan pihak berkepentingan yang terjejas dengan sewajarnya.',
        'Fokus pada membina semula kepercayaan melalui tindakan susulan yang konsisten dan telus.',
      ],
    },
    {
      id: 'glossary',
      titleEn: 'Key Terms (Glossary)',
      titleBm: 'Istilah Utama (Glosari)',
      contentEn: [
        'Holding statement / Pernyataan awal — Short initial public message that acknowledges the situation without speculation.',
        'Material information / Maklumat material — Information that could reasonably affect the share price or investment decisions.',
        'Crisis Lead / Ketua Krisis — Pre-designated person with authority to coordinate the response.',
        'Severity level / Tahap keterukan — Classification from Level 1 (routine) to Level 4 (critical).',
        'Disclosure / Pendedahan — Regulatory obligation to announce material information via official channels.',
        'Stakeholders / Pihak berkepentingan — All parties with an interest in or affected by the organisation.',
      ],
      contentBm: [
        'Holding statement / Pernyataan awal — Mesej awam awal yang ringkas yang mengakui situasi tanpa spekulasi.',
        'Material information / Maklumat material — Maklumat yang munasabah boleh menjejaskan harga saham atau keputusan pelaburan.',
        'Crisis Lead / Ketua Krisis — Individu yang ditetapkan terlebih dahulu dengan kuasa menyelaraskan respons.',
        'Severity level / Tahap keterukan — Pengelasan dari Tahap 1 (biasa) hingga Tahap 4 (kritikal).',
        'Disclosure / Pendedahan — Kewajipan peraturan untuk mengumumkan maklumat material melalui saluran rasmi.',
        'Stakeholders / Pihak berkepentingan — Semua pihak yang mempunyai kepentingan atau terjejas oleh organisasi.',
      ],
    },
    {
      id: 'disclaimer',
      titleEn: 'Important Disclaimer',
      titleBm: 'Penafian Penting',
      contentEn: [
        'This Manual and the companion Playbook do not constitute legal advice.',
        'All regulatory references must be verified against the latest Bursa Malaysia Listing Requirements, Companies Act 2016, PDPA, and advice from external counsel.',
        'Content should be reviewed by native BM speakers and legal advisors before formal adoption by any organisation.',
      ],
      contentBm: [
        'Manual ini dan Playbook yang menyertainya tidak merupakan nasihat undang-undang.',
        'Semua rujukan peraturan mesti disahkan terhadap Peraturan Penyenaraian Bursa Malaysia terkini, Akta Syarikat 2016, PDPA, dan nasihat daripada penasihat luar.',
        'Kandungan harus disemak oleh penutur asli BM dan penasihat undang-undang sebelum penerimaan formal oleh mana-mana organisasi.',
      ],
    },
  ]

  return (
    <div className="manual-view">
      <div className="manual-header">
        <h2>{t('Crisis Communications Manual', 'Manual Komunikasi Krisis')}</h2>
        <p className="manual-sub">
          {t(
            'Comprehensive Malaysia Edition – Reference guidance supporting the operational Playbook.',
            'Edisi Komprehensif Malaysia – Panduan rujukan yang menyokong Playbook operasi.'
          )}
        </p>
        <button className="btn btn-primary" onClick={onBackToPlaybook}>
          ← {t('Back to Playbook', 'Kembali ke Playbook')}
        </button>
      </div>

      {sections.map((section) => (
        <section key={section.id} className="card manual-section">
          <h3>{lang === 'bm' ? section.titleBm : section.titleEn}</h3>
          <ul className="manual-list">
            {(lang === 'bm' ? section.contentBm : section.contentEn).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <div className="manual-footer-note">
        {t(
          'For live response, return to Playbook Mode. This Manual is for preparation, training and reference.',
          'Untuk respons langsung, kembali ke Mod Playbook. Manual ini adalah untuk persediaan, latihan dan rujukan.'
        )}
      </div>
    </div>
  )
}
