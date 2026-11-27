export interface SeedTopic {
  slug: string;
  title: string;
  subtitle: string;
  region: string;
  era: string;
  themeKey: string;
  summary: string;
  fullContent: string;
  keyFacts: { label: string; value: string }[];
  timeline: { year: string; event: string }[];
  mediaSpecs: {
    title: string;
    caption: string;
    plateCode: string;
    category: 'Cartographic Plate' | 'Archival Artifact' | 'Architectural Diagram';
    motif: 'manuscript' | 'fresco' | 'pyramid' | 'temple' | 'dam' | 'ceramic' | 'fortress' | 'atoll' | 'mountain' | 'dossier' | 'botanical' | 'monastery' | 'voyage' | 'facade' | 'minaret' | 'volcanic' | 'seal' | 'coinage' | 'lagoon' | 'cavalry';
  }[];
}

export const SEED_TOPICS: SeedTopic[] = [
  {
    slug: 'mali-empire',
    title: 'The Mali Empire (and the Library of Timbuktu)',
    subtitle: 'Trans-Saharan gold trade, Sundiata Keita, and West African intellectual scholarship',
    region: 'West Africa',
    era: 'c. 1235 – 1670 CE',
    themeKey: 'mali-empire',
    summary:
      'Founded by Sundiata Keita, the Mali Empire became one of the wealthiest and most learned civilizations of the medieval world, anchoring trans-Saharan commerce and the renowned Sankore manuscripts of Timbuktu.',
    fullContent: `## Imperial Foundations & Governance
Emerging in the Upper Niger basin after the Battle of Kirina (c. 1235 CE), the Mali Empire united Mandinka chiefdoms under the oral constitutional charter known as the Kouroukan Fouga. Provincial governors (farbas) administered tributary kingdoms while allowing regional autonomy and religious pluralism.

## Economic Mastery & Mansa Musa
Controlling the Bambuk, Bure, and Akan goldfields alongside Taghaza salt caravans, Mali mediated nearly half of the Old World's gold supply. During his 1324–1325 pilgrimage to Mecca, Mansa Musa's lavish gold distributions reshaped Mediterranean currency markets and placed Mali prominently on the 1375 Catalan Atlas.

## The Libraries of Timbuktu
Under imperial patronage, Timbuktu and Djenné flourished as centers of astronomy, jurisprudence, mathematics, medicine, and historiography. Hundreds of thousands of manuscripts—copied in Sudanese calligraphic scripts and preserved by scholarly families—testify to a thriving West African literary tradition.`,
    keyFacts: [
      { label: 'Capital', value: 'Niani (Imperial), Timbuktu (Scholarly Hub)' },
      { label: 'Founder', value: 'Sundiata Keita (c. 1235 CE)' },
      { label: 'Notable Ruler', value: 'Mansa Musa I (r. 1312–1337)' },
      { label: 'Manuscript Legacy', value: '300,000+ surviving Timbuktu codices' },
    ],
    timeline: [
      { year: '1235 CE', event: 'Sundiata Keita defeats Sosso at Kirina and establishes the Mali Empire.' },
      { year: '1324 CE', event: 'Mansa Musa embarks on his famed trans-Saharan hajj to Mecca.' },
      { year: '1327 CE', event: 'Architect Abu Ishaq al-Sahili oversees expansion of Djinguereber Mosque.' },
      { year: '1375 CE', event: 'Mansa Musa is depicted holding a golden orb on the Catalan Atlas.' },
    ],
    mediaSpecs: [
      {
        title: 'Trans-Saharan Gold & Salt Caravan Atlas',
        caption: 'Restricted archival reconstruction of 14th-century trade arteries linking Niani, Timbuktu, and Taghaza.',
        plateCode: 'MLI-01A',
        category: 'Cartographic Plate',
        motif: 'manuscript',
      },
      {
        title: 'Sankore Astronomical Folio Diagram',
        caption: 'Protected schematic of West African lunar calendar and calligraphic marginalia traditions.',
        plateCode: 'MLI-02B',
        category: 'Archival Artifact',
        motif: 'manuscript',
      },
    ],
  },
  {
    slug: 'minoan-civilization',
    title: 'The Minoan Civilization (Crete)',
    subtitle: 'Bronze Age palatial complexes, Linear A script, and Aegean maritime thalassocracy',
    region: 'Mediterranean Europe',
    era: 'c. 3000 – 1100 BCE',
    themeKey: 'minoan-civilization',
    summary:
      'Flourishing on Crete during the Aegean Bronze Age, the Minoans constructed multi-story palaces equipped with advanced plumbing, painted vivid marine frescoes, and engineered an undeciphered writing system called Linear A.',
    fullContent: `## Palatial Architecture & Urban Engineering
Centers such as Knossos, Phaistos, Malia, and Zakros operated as administrative, ceremonial, and redistributive hubs. Minoan engineers designed lightwells, earthquake-resilient timber-laced masonry, and terracotta drainage pipelines centuries before classical Greece.

## Maritime Networks & Artistic Expression
Minoan vessels sailed to Egypt, the Levant, and Anatolia, trading olive oil, saffron, purple dye, and finely crafted Kamares pottery. Their frescoes—depicting bull-leaping rituals, dolphins, and lilies—display a naturalistic vitality distinct from contemporary Near Eastern art.

## Undeciphered Scripts & Transformation
Alongside Cretan Hieroglyphs and the Phaistos Disc, the Minoans used Linear A for palace accounting. Following the cataclysmic Thera volcanic eruption (c. 1600 BCE) and later Mycenaean expansion, Linear B adapted Minoan signs to record early Greek.`,
    keyFacts: [
      { label: 'Primary Center', value: 'Knossos, Crete' },
      { label: 'Scripts', value: 'Cretan Hieroglyphs, Linear A (undeciphered)' },
      { label: 'Hallmark Art', value: 'Bull-Leaping & Marine Style Frescoes' },
      { label: 'Trade Reach', value: 'Egypt (Keftiu), Levant, Cyclades' },
    ],
    timeline: [
      { year: '2000 BCE', event: 'Construction of the first Protopalatial complexes at Knossos and Phaistos.' },
      { year: '1700 BCE', event: 'Rebuilding of grand Neopalatial palaces after major earthquakes.' },
      { year: '1600 BCE', event: 'Minoan eruption of Thera (Santorini) sends tsunamis across northern Crete.' },
      { year: '1450 BCE', event: 'Mycenaean administrative presence emerges at Knossos with Linear B.' },
    ],
    mediaSpecs: [
      {
        title: 'Knossos Palace Central Court Axonometric Plan',
        caption: 'Restricted architectural study of multi-story lightwells and ceremonial wings.',
        plateCode: 'MIN-01A',
        category: 'Architectural Diagram',
        motif: 'fresco',
      },
      {
        title: 'Aegean Bull-Leaping & Marine Motif Plate',
        caption: 'Protected chromatic analysis of mineral cobalt and iron-oxide fresco pigments.',
        plateCode: 'MIN-02B',
        category: 'Archival Artifact',
        motif: 'fresco',
      },
    ],
  },
  {
    slug: 'kingdom-of-kush',
    title: 'The Kingdom of Kush (Nubia)',
    subtitle: 'Nubian pharaohs of the 25th Dynasty, Meroitic script, and Nile iron metallurgy',
    region: 'Northeast Africa',
    era: 'c. 1070 BCE – 350 CE',
    themeKey: 'kingdom-of-kush',
    summary:
      'Located south of Egypt along the Nile cataracts in modern Sudan, the Kingdom of Kush built more pyramids than Egypt, ruled a unified Nile empire as the 25th Dynasty, and pioneered iron smelting at Meroë.',
    fullContent: `## Napata & The 25th Dynasty of Egypt
Rising from the heritage of Kerma, the Napatan rulers of Kush—led by Kashta, Piye, and Taharqa—reunified Egypt in the 8th century BCE. Far from foreign destroyers, Kushite pharaohs initiated an architectural and religious renaissance reviving Old Kingdom temple traditions.

## The Meroitic Era & Kandake Queens
When the royal capital shifted southward to Meroë, Kush cultivated an independent cultural identity centered on the lion-god Apedemak, monumental reservoirs (hafirs), and vast iron-smelting furnaces. Powerful queen mothers known as Kandakes (Candaces) commanded armies and negotiated directly with Imperial Rome.

## Pyramids & Meroitic Script
Over 200 steep-angled sandstone pyramids stand at Nuri, El-Kurru, and Meroë. Kushite scribes created the Meroitic alphabetic script—whose phonetic values are known, though its underlying grammar remains a major frontier in African linguistics.`,
    keyFacts: [
      { label: 'Capitals', value: 'Napata, later Meroë (Sudan)' },
      { label: 'Pyramids Built', value: '200+ steep royal pyramids' },
      { label: 'Notable Rulers', value: 'Piye, Taharqa, Kandake Amanirenas' },
      { label: 'Industry', value: 'Large-scale iron smelting & gold mining' },
    ],
    timeline: [
      { year: '744 BCE', event: 'King Piye conquers Egypt, inaugurating the Kushite 25th Dynasty.' },
      { year: '590 BCE', event: 'Administrative center shifts south to Meroë between the 5th and 6th cataracts.' },
      { year: '24 BCE', event: 'Kandake Amanirenas leads Kushite forces against Roman Egypt and secures a favorable treaty.' },
      { year: '350 CE', event: 'King Ezana of Aksum records campaign marking the end of Meroitic state power.' },
    ],
    mediaSpecs: [
      {
        title: 'Meroë Royal Necropolis Elevation Study',
        caption: 'Restricted sectional drawing comparing steep 70-degree Kushite pyramid geometry.',
        plateCode: 'KSH-01A',
        category: 'Architectural Diagram',
        motif: 'pyramid',
      },
      {
        title: 'Nile Cataracts & Iron Smelting Corridor Map',
        caption: 'Protected survey of Napata–Meroë riverine trade and metallurgical slag mounds.',
        plateCode: 'KSH-02B',
        category: 'Cartographic Plate',
        motif: 'pyramid',
      },
    ],
  },
  {
    slug: 'khmer-empire',
    title: 'The Khmer Empire (Angkor, Cambodia)',
    subtitle: 'Hydraulic mega-urbanism, Angkor Wat temple-mountains, and Southeast Asian statecraft',
    region: 'Southeast Asia',
    era: '802 – 1431 CE',
    themeKey: 'khmer-empire',
    summary:
      'At its zenith, Angkor was the largest pre-industrial urban complex on Earth—sustained by a vast hydraulic network of baray reservoirs and crowned by monumental sandstone temples like Angkor Wat and the Bayon.',
    fullContent: `## Devaraja & Sacred Architecture
In 802 CE, Jayavarman II proclaimed universal sovereignty on Phnom Kulen, establishing the Khmer state. Successive monarchs built ever grander temple-mountains aligned with Hindu and Mahayana Buddhist cosmology, culminating in Suryavarman II's Angkor Wat and Jayavarman VII's fortified city of Angkor Thom.

## Hydraulic Engineering at Scale
LiDAR surveys reveal Greater Angkor spanned over 1,000 square kilometers, supporting an estimated 750,000+ inhabitants. Massive earthen reservoirs (barays), canals, and embankments captured monsoon rains to irrigate up to three rice harvests annually.

## Roads, Hospitals & Resilience
Jayavarman VII constructed over 100 public hospitals (arogyashalas) and highway rest-houses linking provincial centers from the Mekong Delta to the Khorat Plateau. Prolonged 14th-century megadroughts and shifting maritime trade eventually prompted the court to relocate toward Phnom Penh.`,
    keyFacts: [
      { label: 'Urban Area', value: '~1,000 km² Greater Angkor metropolis' },
      { label: 'Iconic Monument', value: 'Angkor Wat (built c. 1113–1150 CE)' },
      { label: 'Hydraulic Marvel', value: 'West Baray (8 km × 2.1 km reservoir)' },
      { label: 'Script', value: 'Old Khmer & Sanskrit stone inscriptions' },
    ],
    timeline: [
      { year: '802 CE', event: 'Jayavarman II inaugurates the Khmer Empire on Mount Kulen.' },
      { year: '1113 CE', event: 'Suryavarman II begins construction of Angkor Wat dedicated to Vishnu.' },
      { year: '1181 CE', event: 'Jayavarman VII builds Angkor Thom, Bayon, and 102 imperial hospitals.' },
      { year: '1431 CE', event: 'Ayutthaya sack accelerates political relocation south to the Mekong.' },
    ],
    mediaSpecs: [
      {
        title: 'Angkor Hydraulic Baray & Canal Grid',
        caption: 'Restricted LiDAR-inspired schematic of monsoon water capture and distribution.',
        plateCode: 'KHM-01A',
        category: 'Cartographic Plate',
        motif: 'temple',
      },
      {
        title: 'Quincunx Temple-Mountain Proportion Plate',
        caption: 'Protected architectural geometry of Mount Meru symbolism in Khmer sandstone.',
        plateCode: 'KHM-02B',
        category: 'Architectural Diagram',
        motif: 'temple',
      },
    ],
  },
  {
    slug: 'kingdom-of-saba',
    title: 'The Kingdom of Saba (Ancient Yemen)',
    subtitle: 'The Great Dam of Marib, South Arabian inscriptions, and the ancient incense monopoly',
    region: 'Arabian Peninsula',
    era: 'c. 1200 BCE – 275 CE',
    themeKey: 'kingdom-of-saba',
    summary:
      'Known in ancient Mediterranean and Near Eastern texts as Sheba, the Kingdom of Saba transformed arid highlands into fertile oases through the monumental Great Dam of Marib and dominated the frankincense and myrrh trade.',
    fullContent: `## Engineering the Desert: The Great Dam of Marib
Situated along Wadi Dhana, Sabaean engineers built a 600-meter-long earthen and stone masonry dam with colossal sluice gates. For over a millennium, this irrigation system watered nearly 25,000 acres of terraced orchards, earning the region the classical epithet Arabia Felix ("Fortunate Arabia").

## The Incense Road & Literacy
Caravans departed Sabaean territories loaded with frankincense, myrrh, and Indian Ocean spices bound for Gaza, Petra, and Mesopotamia. Sabaeans inscribed thousands of public laws, agricultural treaties, and votive bronzes in the geometric Musnad (Old South Arabian) script.

## Sacred Sanctuaries & Geopolitics
The Awam Temple (Mahram Bilqis) near Marib featured a massive oval sanctuary wall and pillared propylon dedicated to the deity Almaqah. Saba's cultural influence extended across the Red Sea into the Ethiopian highlands, helping shape early Aksumite architecture and script.`,
    keyFacts: [
      { label: 'Capital', value: 'Marib (ancient Yemen)' },
      { label: 'Engineering Icon', value: 'Great Dam of Marib (c. 8th c. BCE)' },
      { label: 'Primary Exports', value: 'Frankincense, Myrrh, Aromatics' },
      { label: 'Writing System', value: 'Ancient South Arabian (Musnad)' },
    ],
    timeline: [
      { year: '1000 BCE', event: 'Sabaean confederation consolidates trade routes across southwestern Arabia.' },
      { year: '750 BCE', event: 'Major stone sluice upgrades expand the Great Dam of Marib.' },
      { year: '25 BCE', event: 'Roman expedition under Aelius Gallus fails to capture Marib.' },
      { year: '275 CE', event: 'Himyarite Kingdom absorbs Saba into a unified South Arabian realm.' },
    ],
    mediaSpecs: [
      {
        title: 'Marib Dam North & South Sluice Blueprint',
        caption: 'Restricted engineering reconstruction of Sabaean flash-flood diversion channels.',
        plateCode: 'SAB-01A',
        category: 'Architectural Diagram',
        motif: 'dam',
      },
      {
        title: 'South Arabian Incense Corridor & Musnad Key',
        caption: 'Protected archival plate tracing Dhofar–Marib–Gaza caravan stations.',
        plateCode: 'SAB-02B',
        category: 'Cartographic Plate',
        motif: 'dam',
      },
    ],
  },
  {
    slug: 'etruscan-civilization',
    title: 'The Etruscan Civilization',
    subtitle: 'Pre-Roman federation of Tuscany, bronze mastery, and cultural foundations of Rome',
    region: 'Mediterranean Europe',
    era: 'c. 900 – 27 BCE',
    themeKey: 'etruscan-civilization',
    summary:
      'Long before Rome dominated Italy, the Etruscan League of Twelve Cities forged a cosmopolitan urban culture famed for terracotta sculpture, bronze metallurgy, egalitarian social status for women, and engineering innovations inherited by Rome.',
    fullContent: `## Urban Federation & Trade
Organized around autonomous city-states including Tarquinia, Veii, Cerveteri, Vulci, and Volterra, Etruria tapped iron and copper deposits from Elba and Tuscany. Etruscan merchants traded vigorously with Phoenician Carthage and Greek colonies, adapting the Euboean alphabet into the precursor of the Latin script.

## Art, Necropolises & Social Life
Etruscan tombs at Cerveteri and Tarquinia were carved like domestic residences and adorned with joyful banquet frescoes and terracotta sarcophagi such as the Sarcophagus of the Spouses. Contemporary Greek and Roman writers marveled that Etruscan women dined alongside men, owned property, and bore their own family names.

## Legacy in Roman Institutions
From the Roman toga, fasces, triumphal processions, and vaulted arches (such as the Cloaca Maxima) to divination practices (Etrusca Disciplina), Etruscan civilization laid the civic and architectural bedrock of the Roman Republic.`,
    keyFacts: [
      { label: 'Core Territory', value: 'Etruria (modern Tuscany, Umbria, Lazio)' },
      { label: 'Political Structure', value: 'Dodecapolis (League of Twelve Cities)' },
      { label: 'Language Family', value: 'Tyrsenian (non-Indo-European isolate)' },
      { label: 'Signature Craft', value: 'Bucchero black pottery & bronze casting' },
    ],
    timeline: [
      { year: '800 BCE', event: 'Villanovan settlements coalesce into fortified Etruscan city-states.' },
      { year: '616 BCE', event: 'Tarquinius Priscus begins Etruscan dynastic rule in early Rome.' },
      { year: '535 BCE', event: 'Etruscan-Carthaginian fleet contests Tyrrhenian Sea at Battle of Alalia.' },
      { year: '90 BCE', event: 'Etruscan cities receive full Roman citizenship after the Social War.' },
    ],
    mediaSpecs: [
      {
        title: 'Banditaccia Tumulus Necropolis Cross-Section',
        caption: 'Restricted architectural plan of rock-cut chamber tombs in Cerveteri.',
        plateCode: 'ETR-01A',
        category: 'Architectural Diagram',
        motif: 'ceramic',
      },
      {
        title: 'Bronze Liver of Piacenza Divination Grid',
        caption: 'Protected schematic mapping 16 Etruscan celestial houses and deity inscriptions.',
        plateCode: 'ETR-02B',
        category: 'Archival Artifact',
        motif: 'ceramic',
      },
    ],
  },
  {
    slug: 'hittite-empire',
    title: 'The Hittite Empire',
    subtitle: 'Anatolian superpower, the Treaty of Kadesh, and earliest Indo-European state archives',
    region: 'Anatolia & Near East',
    era: 'c. 1650 – 1178 BCE',
    themeKey: 'hittite-empire',
    summary:
      'From their mountain capital of Hattusa, the Hittites built a formidable Bronze Age empire rivaling New Kingdom Egypt, leaving behind tens of thousands of cuneiform tablets and the world’s earliest surviving international peace treaty.',
    fullContent: `## Imperial Power & Diplomacy
Speaking the oldest attested Indo-European language (Nesili), Hittite kings such as Hattusili I, Suppiluliuma I, and Muwatalli II unified central Anatolia and projected power into northern Syria. Following the massive chariot clash at Kadesh (c. 1274 BCE), Hattusili III and Ramesses II ratified the Silver Treaty—still displayed in replica at UN Headquarters.

## Hattusa & Legal Innovations
Hattusa boasted cyclopean double fortifications, underground posterns, monumental lion and sphinx gates, and the rock-cut sanctuary of Yazılıkaya. Hittite law codes were notably pragmatic, emphasizing restitution and compensation over harsh corporal punishment.

## Ironworking & Bronze Age Collapse
Hittite smiths refined early iron smelting techniques alongside bronze weaponry. Around 1180 BCE, converging crises—drought, internal rivalries, Kaska raids, and eastern Mediterranean disruptions—brought down the imperial center, though Syro-Hittite states endured for centuries.`,
    keyFacts: [
      { label: 'Capital', value: 'Hattusa (Boğazkale, Turkey)' },
      { label: 'Language', value: 'Hittite (oldest recorded Indo-European language)' },
      { label: 'Diplomatic Milestone', value: 'Egyptian–Hittite Peace Treaty (1259 BCE)' },
      { label: 'Archive Size', value: '30,000+ cuneiform clay tablets discovered' },
    ],
    timeline: [
      { year: '1650 BCE', event: 'Hattusili I establishes Hattusa as the Hittite royal stronghold.' },
      { year: '1595 BCE', event: 'Mursili I raids Babylon, ending the Amorite dynasty of Hammurabi.' },
      { year: '1274 BCE', event: 'Battle of Kadesh pits thousands of Hittite and Egyptian chariots.' },
      { year: '1259 BCE', event: 'Eternal Treaty of Kadesh establishes mutual defense and extradition.' },
    ],
    mediaSpecs: [
      {
        title: 'Hattusa Lion Gate & Upper Fortification Survey',
        caption: 'Restricted topographical diagram of cyclopean wall segments and tunnel posterns.',
        plateCode: 'HIT-01A',
        category: 'Architectural Diagram',
        motif: 'fortress',
      },
      {
        title: 'Kadesh Cuneiform Treaty Diplomatic Clause Map',
        caption: 'Protected archival layout of Akkadian parity clauses between Hattusa and Pi-Ramesses.',
        plateCode: 'HIT-02B',
        category: 'Archival Artifact',
        motif: 'fortress',
      },
    ],
  },
  {
    slug: 'kiribati',
    title: 'Kiribati (Pacific Microstate)',
    subtitle: 'Spanning all four hemispheres, Micronesian navigation, and frontline climate diplomacy',
    region: 'Oceania (Micronesia)',
    era: 'Ancient Settlement – Present',
    themeKey: 'kiribati',
    summary:
      'Comprising 32 coral atolls and one raised coral island scattered across 3.5 million square kilometers of the central Pacific, Kiribati is the only nation situated in all four hemispheres and a global voice on oceanic sovereignty and climate resilience.',
    fullContent: `## Geography Across Four Hemispheres
Straddling both the Equator and the 180th meridian, Kiribati includes the Gilbert, Phoenix, and Line island groups. In 1995, the republic realigned the International Date Line so all islands share the same business day, making Caroline Atoll (Millennium Island) among the first places on Earth to greet each new day.

## Maneaba Governance & Maritime Heritage
Traditional I-Kiribati society centers on the maneaba—a soaring thatched meeting house governed by consensus, hospitality, and oral genealogy. Master navigators (tiaborau) crossed vast ocean expanses reading wave refraction, stars, and seabird flight paths.

## Ocean Conservation & Climate Geopolitics
With most land sitting less than two meters above sea level, Kiribati established the Phoenix Islands Protected Area (PIPA) and pioneered international legal debates on "migration with dignity," maritime Exclusive Economic Zone permanence, and blue-carbon stewardship.`,
    keyFacts: [
      { label: 'Capital', value: 'South Tarawa' },
      { label: 'Oceanic EEZ', value: '3.5 million km² (land area: 811 km²)' },
      { label: 'Unique Distinction', value: 'Only country in all 4 hemispheres' },
      { label: 'Independence', value: 'July 12, 1979 (from United Kingdom)' },
    ],
    timeline: [
      { year: 'c. 1000 BCE', event: 'Austronesian voyagers settle the Gilbert Islands atolls.' },
      { year: '1943 CE', event: 'Battle of Tarawa marks a pivotal Pacific theater turning point.' },
      { year: '1979 CE', event: 'Republic of Kiribati achieves full independence.' },
      { year: '1995 CE', event: 'Date Line realignment unifies eastern and western island calendars.' },
    ],
    mediaSpecs: [
      {
        title: 'Four-Hemisphere EEZ & Date Line Cartogram',
        caption: 'Restricted maritime projection displaying Gilbert, Phoenix, and Line atoll clusters.',
        plateCode: 'KIR-01A',
        category: 'Cartographic Plate',
        motif: 'atoll',
      },
      {
        title: 'Atoll Freshwater Lens & Sea-Level Elevation Profile',
        caption: 'Protected hydrogeological cross-section of Tarawa coral reef sustainability.',
        plateCode: 'KIR-02B',
        category: 'Architectural Diagram',
        motif: 'atoll',
      },
    ],
  },
  {
    slug: 'lesotho',
    title: 'Lesotho (The Kingdom in the Sky)',
    subtitle: 'Highest low-point nation on Earth, Moshoeshoe I’s mountain fortress, and enclave geopolitics',
    region: 'Southern Africa',
    era: '1822 – Present',
    themeKey: 'lesotho',
    summary:
      'Completely enclaved within South Africa, Lesotho is the only independent state whose entire territory lies above 1,000 meters in elevation—forged through King Moshoeshoe I’s diplomatic genius at the mountain fortress of Thaba Bosiu.',
    fullContent: `## Moshoeshoe I & Thaba Bosiu
During the turbulent early 19th-century Mfecane upheavals, chief Moshoeshoe I gathered displaced clans atop Thaba Bosiu ("Mountain at Night"), an impregnable sandstone plateau. Through astute diplomacy, hospitality toward refugees, and defensive skill, he welded the Basotho nation together.

## Alpine Enclave & Water Diplomacy
Rising to 3,482 meters at Thabana Ntlenyana in the Maluti Mountains, Lesotho’s lowest point (1,400 m) is higher than any other nation's lowest point. Its abundant highland rivers power the Lesotho Highlands Water Project, supplying vital fresh water and hydroelectricity across southern Africa.

## Living Basotho Heritage
Distinctive Basotho cultural symbols—including the conical mokorotlo woven hat, patterned wool blankets (Seanamarena), and sure-footed Basotho ponies—reflect resilient adaptation to crisp alpine winters and rugged mountain passes.`,
    keyFacts: [
      { label: 'Capital', value: 'Maseru' },
      { label: 'Lowest Elevation', value: '1,400 m (highest low point in the world)' },
      { label: 'Founder', value: 'King Moshoeshoe I (1822)' },
      { label: 'Geopolitical Status', value: 'Sovereign enclave surrounded by South Africa' },
    ],
    timeline: [
      { year: '1824 CE', event: 'Moshoeshoe I establishes the mountain stronghold of Thaba Bosiu.' },
      { year: '1868 CE', event: 'Basutoland becomes a British protectorate to preserve autonomy.' },
      { year: '1966 CE', event: 'Kingdom of Lesotho gains independence as a constitutional monarchy.' },
      { year: '1998 CE', event: 'Phase 1A of the Lesotho Highlands Water Project (Katse Dam) opens.' },
    ],
    mediaSpecs: [
      {
        title: 'Maluti Range & Katse Watershed Elevation Map',
        caption: 'Restricted hypsometric profile of Lesotho’s alpine plateaus and river valleys.',
        plateCode: 'LSO-01A',
        category: 'Cartographic Plate',
        motif: 'mountain',
      },
      {
        title: 'Thaba Bosiu Natural Escarpment Defense Study',
        caption: 'Protected historical topography of the six mountain passes guarding the royal plateau.',
        plateCode: 'LSO-02B',
        category: 'Architectural Diagram',
        motif: 'mountain',
      },
    ],
  },
  {
    slug: 'transnistria',
    title: 'Transnistria (Unrecognized State)',
    subtitle: 'Frozen conflict geopolitics, Dniester corridor autonomy, and unrecognized statecraft',
    region: 'Eastern Europe',
    era: '1990 – Present',
    themeKey: 'transnistria',
    summary:
      'Officially the Pridnestrovian Moldavian Republic (PMR), Transnistria is a narrow strip of land between the Dniester River and Ukraine—internationally recognized as part of Moldova yet operating de facto with its own currency, constitution, and border controls.',
    fullContent: `## Historical Genesis & 1992 Conflict
Historically linked to the Moldavian ASSR created within Soviet Ukraine in 1924, the industrialized left bank of the Dniester diverged politically from Chișinău during the dissolution of the USSR. Following a brief armed conflict in 1992, a ceasefire established a trilateral peacekeeping security zone along the river.

## De Facto Institutions & Parallel Economy
From its capital in Tiraspol, Transnistria mints the Transnistrian ruble (famous for issuing composite plastic coins), operates its own postal and judicial systems, and hosts major heavy industry including the Cuciurgan power station and Moldova Steel Works. Yet its firms register in Chișinău to export into European Union markets.

## Geopolitical Limbo
Unrecognized by any UN member state, Transnistria represents a key case study in international law regarding Montevideo Convention statehood criteria, frozen conflicts, energy corridors, and post-Soviet identity politics.`,
    keyFacts: [
      { label: 'Administrative Center', value: 'Tiraspol' },
      { label: 'Legal Status', value: 'De jure Moldova; de facto autonomous (unrecognized)' },
      { label: 'Local Currency', value: 'Transnistrian ruble (non-convertible)' },
      { label: 'Geographic Boundary', value: '400 km strip along eastern Dniester River' },
    ],
    timeline: [
      { year: '1924 CE', event: 'Moldavian ASSR established on the eastern bank of the Dniester.' },
      { year: '1990 CE', event: 'Local deputies proclaim the Pridnestrovian Moldavian Republic.' },
      { year: '1992 CE', event: 'Ceasefire agreement ends active hostilities and creates a security zone.' },
      { year: '2014 CE', event: 'Transnistria issues geometric composite plastic coins alongside paper notes.' },
    ],
    mediaSpecs: [
      {
        title: 'Dniester Corridor & Security Zone Cartography',
        caption: 'Restricted geopolitical map of crossing checkpoints, Bender enclave, and river bridges.',
        plateCode: 'TRN-01A',
        category: 'Cartographic Plate',
        motif: 'dossier',
      },
      {
        title: 'Comparative Unrecognized Statehood Legal Matrix',
        caption: 'Protected research dossier examining de facto institutions vs. diplomatic recognition.',
        plateCode: 'TRN-02B',
        category: 'Archival Artifact',
        motif: 'dossier',
      },
    ],
  },
  {
    slug: 'socotra-island',
    title: 'Socotra Island (Yemen)',
    subtitle: 'Galápagos of the Indian Ocean, Dragon’s Blood trees, and ancient maritime crossroads',
    region: 'Indian Ocean / Yemen',
    era: 'Paleolithic – Present',
    themeKey: 'socotra-island',
    summary:
      'Separated from mainland Gondwana millions of years ago, Socotra Island hosts an extraordinary concentration of endemic species—most famously the umbrella-shaped Dragon’s Blood tree—alongside ancient cave inscriptions left by ancient Indian Ocean mariners.',
    fullContent: `## Evolutionary Isolation & Endemism
More than 37% of Socotra’s plant species, 90% of its reptiles, and 95% of its land snails exist nowhere else on Earth. Perched on the arid limestone Hagher plateaus, Dracaena cinnabari (Dragon's Blood tree) channels coastal mist down its dense canopy into its roots and yields crimson resin prized since antiquity for medicine and lacquer.

## Maritime Crossroads & Hoq Cave
Described in the 1st-century CE Periplus of the Erythraean Sea as Dioscorida, Socotra was a vital monsoon stopover linking India, East Africa, Arabia, and the Greco-Roman world. Inside the 3-kilometer Hoq Cave, archaeologists discovered over 200 ancient inscriptions in Brahmi, South Arabian, Ge'ez, Palmyrene, and Greek.

## Soqotri Language & Conservation
Indigenous islanders speak Soqotri, a pre-literate Modern South Arabian language with rich oral poetry. Recognized as a UNESCO World Heritage Site in 2008, the archipelago faces delicate challenges balancing ecotourism, cyclone resilience, and regional geopolitical pressures.`,
    keyFacts: [
      { label: 'Main Town', value: 'Hadibu' },
      { label: 'Endemic Flora', value: '307 of 825 plant species unique to Socotra' },
      { label: 'Signature Species', value: 'Dracaena cinnabari (Dragon’s Blood Tree)' },
      { label: 'UNESCO Status', value: 'Natural World Heritage Site (2008)' },
    ],
    timeline: [
      { year: 'c. 60 CE', event: 'Periplus of the Erythraean Sea documents Socotra’s cosmopolitan ports.' },
      { year: '1507 CE', event: 'Portuguese fleet briefly occupies Suq to control Red Sea spice lanes.' },
      { year: '2001 CE', event: 'Hoq Cave multilingual inscriptions from ancient Indian Ocean sailors discovered.' },
      { year: '2008 CE', event: 'Socotra Archipelago inscribed as a UNESCO World Heritage Site.' },
    ],
    mediaSpecs: [
      {
        title: 'Dracaena Cinnabari Mist-Capture Botanical Plate',
        caption: 'Restricted scientific illustration of umbrella canopy hydrology and crimson resin.',
        plateCode: 'SOC-01A',
        category: 'Archival Artifact',
        motif: 'botanical',
      },
      {
        title: 'Hoq Cave Monsoon Trade Epigraphy Map',
        caption: 'Protected geographic chart linking Socotra inscriptions to Gujarat, Aksum, and Palmyra.',
        plateCode: 'SOC-02B',
        category: 'Cartographic Plate',
        motif: 'botanical',
      },
    ],
  },
  {
    slug: 'kingdom-of-mustang',
    title: 'The Kingdom of Mustang (Nepal)',
    subtitle: 'Forbidden walled city of Lo Manthang, trans-Himalayan salt routes, and sky caves',
    region: 'South Asia (Himalayas)',
    era: '1380 – 2008 CE (Cultural Heritage Ongoing)',
    themeKey: 'kingdom-of-mustang',
    summary:
      'Tucked in the arid rain shadow north of the Annapurna massif, the former Kingdom of Lo (Upper Mustang) preserved medieval Tibetan Buddhist culture behind the earthen ramparts of Lo Manthang and amidst thousands of cliffside sky caves.',
    fullContent: `## Founding of Lo & The Salt Trade
In 1380 CE, warrior-prince Ame Pal founded the walled capital of Lo Manthang along the Kali Gandaki gorge—the deepest canyon on Earth and a vital artery for Tibetan salt traded south for Nepalese grain. Strategically positioned between Tibet and Nepal, Mustang flourished as an autonomous kingdom tributary to Kathmandu from 1795 onward.

## Monastic Art & Sky Caves
Mustang’s 15th-century gompas—Jampa Lhakhang and Thubchen—house monumental mandala murals painted with mineral lapis, malachite, and gold. High above the valleys, more than 10,000 man-made "sky caves" carved into sheer conglomerate cliffs served as ancient burial chambers, meditation hermitages, and manuscript vaults.

## Opening to the Modern World
Restricted to outsiders until 1992, Upper Mustang remains one of the best-preserved traditional Tibetan cultural landscapes. Though Nepal abolished the formal monarchy in 2008, the Lo people continue preserving their festivals (such as Tiji), architecture, and high-altitude heritage.`,
    keyFacts: [
      { label: 'Historic Capital', value: 'Lo Manthang (elevation 3,840 m)' },
      { label: 'Founder', value: 'Ame Pal (1380 CE)' },
      { label: 'Archaeological Enigma', value: '10,000+ cliff-carved Sky Caves' },
      { label: 'Opened to Visitors', value: '1992 (restricted permit area)' },
    ],
    timeline: [
      { year: 'c. 1000 BCE', event: 'Early inhabitants carve high-altitude burial caves into Kali Gandaki cliffs.' },
      { year: '1380 CE', event: 'Ame Pal builds the fortified mudbrick city of Lo Manthang.' },
      { year: '1992 CE', event: 'Upper Mustang opens to limited foreign scholars and travelers.' },
      { year: '2008 CE', event: 'Federal Democratic Republic of Nepal formally ends the Mustang monarchy.' },
    ],
    mediaSpecs: [
      {
        title: 'Lo Manthang Walled City & Gompa Plan',
        caption: 'Restricted urban schematic of the L-shaped ramparts, Royal Palace, and Jampa temple.',
        plateCode: 'MST-01A',
        category: 'Architectural Diagram',
        motif: 'monastery',
      },
      {
        title: 'Kali Gandaki Sky Cave Elevation Profile',
        caption: 'Protected archaeological cross-section of multi-story cliff chambers.',
        plateCode: 'MST-02B',
        category: 'Archival Artifact',
        motif: 'monastery',
      },
    ],
  },
  {
    slug: 'lapita-culture',
    title: 'The Lapita Culture (Ancient Oceania)',
    subtitle: 'Dentate-stamped ceramics, double-hulled voyaging canoes, and the peopling of Polynesia',
    region: 'Oceania (Melanesia & Polynesia)',
    era: 'c. 1600 – 500 BCE',
    themeKey: 'lapita-culture',
    summary:
      'Recognized by their intricately dentate-stamped terracotta pottery, the Lapita peoples launched one of humanity’s greatest maritime migrations—crossing thousands of kilometers of open Pacific Ocean from the Bismarck Archipelago to Fiji, Tonga, and Samoa.',
    fullContent: `## Rapid Maritime Expansion
Beginning around 1600 BCE in the Bismarck Archipelago off Papua New Guinea, Austronesian-speaking Lapita navigators swept eastward across Remote Oceania in a remarkably brief span of 300–500 years. Sailing double-hulled outrigger canoes provisioned with taro, yams, breadfruit, pigs, and chickens, they became the direct ancestors of modern Polynesians.

## Dentate-Stamped Pottery & Obsidian Trade
Lapita artisans pressed toothed bone or shell combs into wet clay to form complex geometric bands and stylized anthropomorphic faces—motifs closely echoed later in Polynesian tattooing (tatau) and barkcloth (tapa). Chemical sourcing proves Lapita networks transported volcanic obsidian from New Britain over 3,000 kilometers across open water.

## Teouma & Bioarchaeology
Excavations at the Teouma cemetery in Vanuatu have transformed our understanding of early Pacific mortuary rituals, dietary adaptation, and ancient DNA, illuminating the shared roots connecting Island Southeast Asia and the vast Polynesian Triangle.`,
    keyFacts: [
      { label: 'Type Site', value: 'Lapita (Koné Peninsula, New Caledonia)' },
      { label: 'Hallmark Artifact', value: 'Dentate-stamped red-slipped ceramics' },
      { label: 'Voyaging Range', value: '4,500+ km across Melanesia to Samoa' },
      { label: 'Legacy', value: 'Ancestral foundation of Polynesian cultures' },
    ],
    timeline: [
      { year: '1600 BCE', event: 'Early Lapita settlements appear in the Bismarck Archipelago.' },
      { year: '1100 BCE', event: 'Navigators cross open ocean into Remote Oceania (Vanuatu & New Caledonia).' },
      { year: '900 BCE', event: 'Lapita voyagers reach Fiji, Tonga, and Samoa.' },
      { year: '500 BCE', event: 'Elaborate dentate decoration transitions into ancestral Polynesian Plainware.' },
    ],
    mediaSpecs: [
      {
        title: 'Lapita Open-Ocean Migration & Obsidian Network',
        caption: 'Restricted maritime chart tracing Bismarck–Vanuatu–Tonga voyaging corridors.',
        plateCode: 'LAP-01A',
        category: 'Cartographic Plate',
        motif: 'voyage',
      },
      {
        title: 'Dentate-Stamped Anthropomorphic Motif Taxonomy',
        caption: 'Protected ceramic iconography plate documenting geometric comb-stamped friezes.',
        plateCode: 'LAP-02B',
        category: 'Archival Artifact',
        motif: 'voyage',
      },
    ],
  },
  {
    slug: 'nabataean-kingdom',
    title: 'The Nabataean Kingdom (Petra)',
    subtitle: 'Rose-red rock-cut monuments, desert hydraulic engineering, and caravan wealth',
    region: 'Levant & Northern Arabia',
    era: 'c. 312 BCE – 106 CE',
    themeKey: 'nabataean-kingdom',
    summary:
      'Mastering water harvesting in arid sandstone canyons, the Nabataeans transformed Petra and Hegra into thriving caravan metropolises—carving towering Hellenistic-Arabian facades directly into rose-red cliffs and evolving the script ancestral to modern Arabic.',
    fullContent: `## Hydraulic Mastery in the Desert
Before building monuments, Nabataean engineers tamed desert flash floods. Terracotta pressure pipelines, rock-cut aqueducts, hidden waterproof plaster cisterns, and stepped retention dams turned the narrow Siq canyon into a lush oasis complete with garden pavilions and monumental pools.

## Architecture & Trade Crossroads
Controlling intersections of the Arabian incense trail, Indian Ocean maritime links, and Damascus trade roads, Nabataean kings such as Aretas IV financed breathtaking rock-cut architecture like Al-Khazneh (The Treasury), Ad-Deir (The Monastery), and the tombs of Hegra (Madain Salih).

## Script & Roman Annexation
Initially writing in Imperial Aramaic, Nabataean cursive script gradually evolved into the direct ancestor of the Arabic alphabet. In 106 CE, Emperor Trajan peacefully annexed the realm as Rome's Provincia Arabia, ushering in a new era of Via Nova Traiana commerce.`,
    keyFacts: [
      { label: 'Capital', value: 'Petra (Raqmu, modern Jordan)' },
      { label: 'Southern Hub', value: 'Hegra (Al-Ula, Saudi Arabia)' },
      { label: 'Hydraulic Innovation', value: 'Pressurized terracotta pipelines & flash-flood dams' },
      { label: 'Script Legacy', value: 'Direct precursor of the modern Arabic alphabet' },
    ],
    timeline: [
      { year: '312 BCE', event: 'Nabataeans successfully defend Petra against Antigonid Greek expeditions.' },
      { year: '9 BCE – 40 CE', event: 'Reign of Aretas IV marks the architectural golden age of Petra.' },
      { year: '106 CE', event: 'Roman Empire annexes the kingdom as Provincia Arabia.' },
      { year: '363 CE', event: 'Major earthquake damages Petra’s urban water systems and theaters.' },
    ],
    mediaSpecs: [
      {
        title: 'Al-Khazneh Rock-Cut Facade Proportions',
        caption: 'Restricted architectural elevation analyzing top-down sandstone cliff carving.',
        plateCode: 'NAB-01A',
        category: 'Architectural Diagram',
        motif: 'facade',
      },
      {
        title: 'Siq Flash-Flood Diversion & Cistern Network',
        caption: 'Protected hydraulic engineering plate of Nabataean gravity-fed aqueducts.',
        plateCode: 'NAB-02B',
        category: 'Cartographic Plate',
        motif: 'facade',
      },
    ],
  },
  {
    slug: 'khanate-of-khiva',
    title: 'The Khanate of Khiva (Central Asia)',
    subtitle: 'Oasis stronghold of Khwarazm, glazed majolica architecture, and Silk Road diplomacy',
    region: 'Central Asia',
    era: '1511 – 1920 CE',
    themeKey: 'khanate-of-khiva',
    summary:
      'Rising from the irrigated oasis of Khwarazm south of the Aral Sea, the Khanate of Khiva crafted the walled inner city of Itchan Kala—an open-air masterpiece of turquoise-glazed minarets, caravanserais, and madrasahs.',
    fullContent: `## Oasis Geopolitics in Khwarazm
Sustained by intricate Amu Darya irrigation canals amidst the Kyzylkum and Karakum deserts, Khiva emerged as the capital of the Khanate after a shift in the river’s course left Old Urgench dry. Ruled by the Arabshahid and later Qungrat dynasties, Khiva balanced relations with Bukhara, Persia, nomadic Turkmen confederations, and Tsarist Russia.

## Architectural Jewel: Itchan Kala
Protected by ten-meter-high crenellated clay walls, Khiva’s inner city preserves over 50 historic monuments—including the unfinished turquoise-tiled Kalta Minor minaret, the 218-column wooden Juma Mosque, and the labyrinthine Tash Khauli Palace.

## Scholarship & Cultural Synthesis
Drawing upon Khwarazm’s ancient scholarly pedigree (the homeland of mathematician al-Khwarizmi), Khivan courts fostered Chagatai literature, intricate woodcarving, silk weaving, and pioneering early Central Asian photography under Khudaybergen Devanov.`,
    keyFacts: [
      { label: 'Historic Core', value: 'Itchan Kala (UNESCO World Heritage Site)' },
      { label: 'Region', value: 'Khwarazm Oasis (modern Uzbekistan)' },
      { label: 'Architectural Icon', value: 'Kalta Minor turquoise majolica minaret' },
      { label: 'Lifeline', value: 'Amu Darya delta irrigation canal system' },
    ],
    timeline: [
      { year: '1511 CE', event: 'Ilbars I establishes the Khanate of Khwarazm, later centered at Khiva.' },
      { year: '1788 CE', event: 'Rebuilding of the 218-pillar wooden Juma Mosque in Itchan Kala.' },
      { year: '1852 CE', event: 'Muhammad Amin Khan initiates construction of the Kalta Minor minaret.' },
      { year: '1873 CE', event: 'Khanate becomes a Russian protectorate until its dissolution in 1920.' },
    ],
    mediaSpecs: [
      {
        title: 'Itchan Kala Inner Citadel & Gate Matrix',
        caption: 'Restricted urban plan mapping Ata Darvoza, Juma Mosque, and Tash Khauli.',
        plateCode: 'KHV-01A',
        category: 'Architectural Diagram',
        motif: 'minaret',
      },
      {
        title: 'Majolica Turquoise Glaze Geometry Plate',
        caption: 'Protected ceramic motif analysis of 19th-century Khivan geometric star tiling.',
        plateCode: 'KHV-02B',
        category: 'Archival Artifact',
        motif: 'minaret',
      },
    ],
  },
  {
    slug: 'sao-tome-principe',
    title: 'São Tomé and Príncipe',
    subtitle: 'Equatorial volcanic islands, cacao heritage, and Einstein’s 1919 eclipse proof',
    region: 'Central Africa (Gulf of Guinea)',
    era: 'c. 1470 – Present',
    themeKey: 'sao-tome-principe',
    summary:
      'Straddling the Equator off Africa’s western coast, São Tomé and Príncipe is Africa’s second-smallest nation—celebrated for dramatic volcanic spires, rare rainforest biodiversity, historic roça estates, and the 1919 solar eclipse expedition that confirmed Einstein’s general relativity.',
    fullContent: `## Volcanic Geography & Endemic Forests
Part of the Cameroon Volcanic Line, the twin islands rise sharply from the Atlantic Ocean, crowned by dramatic phonolite plugs like Pico Cão Grande. Nearly a third of the territory is protected within Obo National Park, harboring endemic giant sunbirds, begonia species, and UNESCO Biosphere Reserve ecosystems on Príncipe.

## Plantation History & Creole Identity
Uninhabited prior to Portuguese arrival around 1470, the islands became an early Atlantic sugar and later world-leading 19th-century cacao producer structured around architectural plantation estates (roças). Out of this complex history emerged vibrant Creole languages (Forro, Angolar, Lung'ie) and expressive music traditions such as Ússua and Tchiloli theater.

## Scientific Milestone: Príncipe 1919
On May 29, 1919, astrophysicist Sir Arthur Eddington photographed a total solar eclipse from Roça Sundy on Príncipe, measuring the gravitational bending of starlight around the Sun and delivering the first empirical confirmation of Albert Einstein's General Theory of Relativity.`,
    keyFacts: [
      { label: 'Capital', value: 'São Tomé' },
      { label: 'Scientific Landmark', value: '1919 Eddington General Relativity Eclipse Site' },
      { label: 'Geological Icon', value: 'Pico Cão Grande (663 m volcanic needle)' },
      { label: 'Independence', value: 'July 12, 1975' },
    ],
    timeline: [
      { year: '1470 CE', event: 'Portuguese navigators chart uninhabited São Tomé and Príncipe.' },
      { year: '1908 CE', event: 'Islands briefly rank as the world’s largest producer of cacao.' },
      { year: '1919 CE', event: 'Arthur Eddington verifies Einstein’s General Relativity on Príncipe.' },
      { year: '2012 CE', event: 'Island of Príncipe designated a UNESCO Biosphere Reserve.' },
    ],
    mediaSpecs: [
      {
        title: '1919 Príncipe Solar Eclipse Starlight Deflection Plate',
        caption: 'Restricted scientific diagram reconstructing Eddington’s Roça Sundy measurements.',
        plateCode: 'STP-01A',
        category: 'Archival Artifact',
        motif: 'volcanic',
      },
      {
        title: 'Cameroon Volcanic Line & Obo Forest Topography',
        caption: 'Protected island bathymetry and volcanic spire elevation survey.',
        plateCode: 'STP-02B',
        category: 'Cartographic Plate',
        motif: 'volcanic',
      },
    ],
  },
  {
    slug: 'dilmun-civilization',
    title: 'The Dilmun Civilization (Ancient Bahrain)',
    subtitle: 'Bronze Age trade entrepôt, Sumerian paradise myth, and ancient burial mound landscapes',
    region: 'Persian Gulf (Bahrain)',
    era: 'c. 3200 – 600 BCE',
    themeKey: 'dilmun-civilization',
    summary:
      'Revered in Mesopotamian epics as the pristine land "where the sun rises," the Dilmun Civilization centered on Bahrain served as the vital Bronze Age maritime hub connecting Sumerian cities, Oman’s copper mines (Magan), and the Indus Valley (Meluhha).',
    fullContent: `## Maritime Entrepôt of the Ancient World
Blessed with natural freshwater artesian springs amid an arid gulf, Dilmun became an indispensable provisioning port and commercial clearinghouse. Merchants standardized Indus-derived weight systems and stamped transactions with distinctive circular steatite Dilmun seals depicting gazelles, ships, and deities.

## Qal'at al-Bahrain & Barbar Temples
Excavations at Qal'at al-Bahrain reveal seven stratified urban layers spanning over 4,000 years—including royal warehouses, fortified sea walls, and date-syrup presses (madbasa). Nearby, the terraced limestone Barbar Temple honored Enki, the Sumerian god of wisdom and subterranean freshwater.

## The Largest Prehistoric Cemetery
Across Bahrain’s western plains, Dilmun citizens built tens of thousands of earthen and stone burial mounds—culminating in monumental two-story Royal Mounds at A'ali—forming one of the densest ancient funerary landscapes anywhere in the world.`,
    keyFacts: [
      { label: 'Archaeological Capital', value: "Qal'at al-Bahrain (UNESCO Site)" },
      { label: 'Trade Partners', value: 'Mesopotamia, Magan (Oman), Indus Valley' },
      { label: 'Funerary Legacy', value: '75,000+ Bronze Age Dilmun Burial Mounds' },
      { label: 'Artifact Signature', value: 'Circular steatite Dilmun stamp seals' },
    ],
    timeline: [
      { year: '2300 BCE', event: 'Sargon of Akkad records Dilmun ships docking at Agade.' },
      { year: '2050 BCE', event: 'Construction of the terraced Barbar Temple complex and royal mounds.' },
      { year: '1800 BCE', event: 'Dilmun monopolizes Gulf copper trade between Magan and Ur.' },
      { year: '2019 CE', event: 'Dilmun Burial Mounds inscribed as a UNESCO World Heritage Site.' },
    ],
    mediaSpecs: [
      {
        title: 'Mesopotamia–Dilmun–Indus Maritime Trade Chart',
        caption: 'Restricted Bronze Age sea-lane projection tracking copper, pearls, and carnelian.',
        plateCode: 'DLM-01A',
        category: 'Cartographic Plate',
        motif: 'seal',
      },
      {
        title: 'Circular Dilmun Stamp Seal Iconography Plate',
        caption: 'Protected typological study of steatite merchant seals and weight standards.',
        plateCode: 'DLM-02B',
        category: 'Archival Artifact',
        motif: 'seal',
      },
    ],
  },
  {
    slug: 'kingdom-of-lydia',
    title: 'The Kingdom of Lydia (Ancient Anatolia)',
    subtitle: 'Invention of standardized coinage, King Croesus, and the Pactolus River gold refineries',
    region: 'Western Anatolia',
    era: 'c. 1200 – 546 BCE',
    themeKey: 'kingdom-of-lydia',
    summary:
      'From their prosperous capital at Sardis, the Lydians revolutionized global economic history by minting the world’s first state-guaranteed electrum, gold, and silver coins—transforming trade, taxation, and retail markets forever.',
    fullContent: `## The Invention of Coinage
Alluvial sands of the Pactolus River carried natural electrum (a gold-silver alloy) directly past Sardis. Around 630–600 BCE, Lydian monarchs stamped uniform-weight electrum nuggets with the roaring lion emblem of the Mermnad dynasty, guaranteeing purity and value by royal seal.

## Croesus & Bimetallic Refining
King Croesus (r. c. 560–546 BCE) went a revolutionary step further: Sardis metallurgists perfected cementation furnaces capable of parting electrum into pure gold and pure silver, issuing the world's first bimetallic currency (the Croeseid). According to Herodotus, Lydians also pioneered permanent retail shops and standardized market exchanges.

## Crossroads of East and West
Bridging Ionian Greek cities and the Anatolian interior, Lydia deeply influenced Greek music (the Lydian mode), cavalry warfare, and luxury textiles. After Cyrus the Great conquered Sardis in 546 BCE, the Achaemenid Persian Empire adopted Lydian coinage and made Sardis the western terminus of the Royal Road.`,
    keyFacts: [
      { label: 'Capital', value: 'Sardis (western Turkey)' },
      { label: 'World First', value: 'Standardized state-minted coins (c. 610 BCE)' },
      { label: 'Metallurgical Breakthrough', value: 'Electrum parting into pure gold & silver' },
      { label: 'Famous Ruler', value: 'King Croesus ("as rich as Croesus")' },
    ],
    timeline: [
      { year: '680 BCE', event: 'Gyges founds the Mermnad dynasty at Sardis.' },
      { year: '610 BCE', event: 'Alyattes issues standardized Lydian Lion electrum staters.' },
      { year: '550 BCE', event: 'Croesus introduces pure gold and silver Croeseid bimetallic coinage.' },
      { year: '546 BCE', event: 'Cyrus the Great incorporates Lydia into the Achaemenid Empire.' },
    ],
    mediaSpecs: [
      {
        title: 'Lydian Lion Stater & Croeseid Numismatic Plate',
        caption: 'Restricted metallurgical breakdown of electrum vs. refined bimetallic standards.',
        plateCode: 'LYD-01A',
        category: 'Archival Artifact',
        motif: 'coinage',
      },
      {
        title: 'Pactolus River Refinery & Royal Road Terminus Map',
        caption: 'Protected archaeological layout of Sardis gold-parting workshops.',
        plateCode: 'LYD-02B',
        category: 'Cartographic Plate',
        motif: 'coinage',
      },
    ],
  },
  {
    slug: 'palau',
    title: 'Palau (Micronesia)',
    subtitle: 'Rock Islands marine sanctuary, matrilineal governance, and pioneering ocean diplomacy',
    region: 'Oceania (Micronesia)',
    era: 'c. 1000 BCE – Present',
    themeKey: 'palau',
    summary:
      'An archipelago of over 340 verdant limestone and volcanic islands in the western Pacific, Palau blends ancient matrilineal clan diplomacy and monumental terraced hills with world-leading marine conservation policies.',
    fullContent: `## Ancient Terraces & Bai Architecture
Archaeological terraces sculpted across Babeldaob Island—dating back over 2,000 years—demonstrate sophisticated prehistoric landscape engineering. Traditional Palauan society is organized around matrilineal clans, with painted wooden men’s meeting houses (bai) recording ancestral legends along carved gable beams.

## Global Conservation Pioneer
Palau leads the world in ocean protection: in 2009 it created the world’s first nationwide shark sanctuary, and in 2015 established the Palau National Marine Sanctuary protecting 80% of its maritime territory from commercial extraction. Every arriving visitor stamps and signs the "Palau Pledge" directly in their passport, vowing ecological respect.

## Rock Islands Southern Lagoon
The UNESCO-listed Rock Islands comprise 445 uninhabited mushroom-shaped limestone islets sheltering 52 marine lakes—including famous Jellyfish Lake—hosting over 385 coral species and vibrant underwater biodiversity.`,
    keyFacts: [
      { label: 'Capital', value: 'Ngerulmud (Babeldaob Island)' },
      { label: 'Marine Sanctuary', value: '80% of EEZ designated no-take reserve' },
      { label: 'Cultural Heritage', value: 'Matrilineal clan system & painted Bai beams' },
      { label: 'Eco-Diplomacy', value: 'World’s first passport eco-pledge (2017)' },
    ],
    timeline: [
      { year: 'c. 1000 BCE', event: 'Early settlers construct terraced earthworks across Babeldaob.' },
      { year: '1994 CE', event: 'Republic of Palau attains full sovereignty under Compact of Free Association.' },
      { year: '2009 CE', event: 'Palau declares the world’s first national shark sanctuary.' },
      { year: '2017 CE', event: 'Palau Pledge becomes mandatory immigration policy for ecological stewardship.' },
    ],
    mediaSpecs: [
      {
        title: 'Rock Islands Karst Lagoon & Marine Sanctuary Map',
        caption: 'Restricted marine zoning chart of Palau’s 80% protected pelagic corridor.',
        plateCode: 'PLW-01A',
        category: 'Cartographic Plate',
        motif: 'lagoon',
      },
      {
        title: 'Babeldaob Prehistoric Terrace & Bai Gable Study',
        caption: 'Protected ethnographic plate illustrating traditional story-board iconography.',
        plateCode: 'PLW-02B',
        category: 'Architectural Diagram',
        motif: 'lagoon',
      },
    ],
  },
  {
    slug: 'kanem-bornu-empire',
    title: 'The Kanem–Bornu Empire (Central Africa)',
    subtitle: 'Thousand-year Sayfawa dynasty, Lake Chad commerce, and armored Sahelian statecraft',
    region: 'Central & West Africa',
    era: 'c. 700 – 1893 CE',
    themeKey: 'kanem-bornu-empire',
    summary:
      'One of Africa’s longest-lived empires, Kanem–Bornu dominated the Lake Chad basin for over a millennium—linking Tripoli and Cairo to sub-Saharan Africa through cavalry diplomacy, royal chronicles (Diwan), and red-brick fortress cities like Ngazargamu.',
    fullContent: `## A Millennium Under the Sayfawa Dynasty
Originating northeast of Lake Chad around 700 CE, the Kanem state embraced Islam in the 11th century under Mai Hume, establishing diplomatic ties with North African sultanates and endowing a hostel (Riwaq al-Barnawi) for scholars at Al-Azhar University in Cairo. When internal rivals pressed Kanem in the late 14th century, the dynasty relocated southwest of Lake Chad to establish the Bornu Empire.

## Mai Idris Alooma & Strategic Modernization
During the late 16th century, Mai Idris Alooma modernized Bornu’s governance, standardized weights and courts, imported Ottoman firearms and military advisors, constructed river transport barges, and codified administrative decrees documented by his chronicler Ahmad ibn Furtu.

## Ngazargamu & Intellectual Culture
The walled brick capital of Ngazargamu served as a vibrant commercial and scholarly center of the central Sudan, producing distinctive Barnawi Quranic calligraphy and maintaining stability across Lake Chad’s diverse Kanuri and neighboring communities for centuries.`,
    keyFacts: [
      { label: 'Historic Capitals', value: 'Njimi (Kanem), Ngazargamu (Bornu)' },
      { label: 'Ruling Dynasty', value: 'Sayfawa Dynasty (~1,000 years of rule)' },
      { label: 'Renowned Reformer', value: 'Mai Idris Alooma (r. 1571–1603)' },
      { label: 'Historical Source', value: 'Diwan of the Sultans of Bornu' },
    ],
    timeline: [
      { year: 'c. 700 CE', event: 'Early Kanem state consolidates trade routes northeast of Lake Chad.' },
      { year: '1085 CE', event: 'Mai Hume establishes Islamic governance and North African diplomatic ties.' },
      { year: '1472 CE', event: 'Mai Ali Gaji founds the fortified brick capital of Ngazargamu.' },
      { year: '1571 CE', event: 'Mai Idris Alooma launches administrative, legal, and military reforms.' },
    ],
    mediaSpecs: [
      {
        title: 'Lake Chad Basin & Tripoli Caravan Axis Map',
        caption: 'Restricted historical cartography tracking Njimi, Ngazargamu, and Fezzan corridors.',
        plateCode: 'KNB-01A',
        category: 'Cartographic Plate',
        motif: 'cavalry',
      },
      {
        title: 'Ngazargamu Red-Brick Citadel & Palace Plan',
        caption: 'Protected archaeological schematic of Bornu’s 15th-century administrative center.',
        plateCode: 'KNB-02B',
        category: 'Architectural Diagram',
        motif: 'cavalry',
      },
    ],
  },
];
