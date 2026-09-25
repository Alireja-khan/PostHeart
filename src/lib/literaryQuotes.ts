export interface LiteraryQuote {
  id: number;
  author: string;
  authorNative?: string;
  title: string;
  era: string;
  nativeQuote?: string;
  englishQuote: string;
  tag: string;
}

export const LITERARY_QUOTES: LiteraryQuote[] = [
  {
    "id": 1,
    "author": "Rabindranath Tagore",
    "authorNative": "রবীন্দ্রনাথ ঠাকুর",
    "title": "Geetabitan (গীতবিতান)",
    "era": "World Bard",
    "nativeQuote": "তুমি রবে নীরবে হৃদয়ে মম, নিবিড় নিভৃত পূর্ণিমা নিশায়...",
    "englishQuote": "You shall abide in silence within my heart, as the full moon rests quietly on a midnight pool of calm water.",
    "tag": "Silent Moon"
  },
  {
    "id": 2,
    "author": "Lord Byron",
    "authorNative": "George Gordon Byron",
    "title": "When We Two Parted",
    "era": "Romantic Elegist",
    "nativeQuote": "If I should meet thee after long years, how should I greet thee? With silence and tears.",
    "englishQuote": "If I should meet thee after long years, how should I greet thee? With silence and tears.",
    "tag": "Silence & Tears"
  },
  {
    "id": 3,
    "author": "Gabriel García Márquez",
    "authorNative": "Gabriel García Márquez",
    "title": "Love in the Time of Cholera",
    "era": "Master of Magical Realism, 1982 Nobel",
    "nativeQuote": "El amor se hace más grande y noble en la calamidad...",
    "englishQuote": "He allowed himself to be swayed by his conviction that human beings are not born once and for all on the day their mothers give birth to them, but that life obliges them over and over again to give birth to themselves through love.",
    "tag": "Reborn in Love"
  },
  {
    "id": 4,
    "author": "Mahmoud Darwish",
    "authorNative": "محمود درويش",
    "title": "The Butterfly's Burden",
    "era": "Voice of Palestinian Poetry",
    "nativeQuote": "ونحن نحب الحياة إذا ما استطعنا إليها سبيلاً...",
    "englishQuote": "I desire you, as the olive tree in the parched desert desires the winter rain. In the desert of the world, your letters are the only green oasis that remains.",
    "tag": "Desert Bloom"
  },
  {
    "id": 5,
    "author": "Rabindranath Tagore",
    "authorNative": "রবীন্দ্রনাথ ঠাকুর",
    "title": "Gitanjali (গীতাঞ্জলি)",
    "era": "Nobel Laureate in Literature, 1913",
    "nativeQuote": "তুমি যে সুরের আগুন লাগিয়ে দিলে মোর প্রাণে, এ আগুন ছড়িয়ে গেল সবখানে...",
    "englishQuote": "Clouds come floating into my life, no longer to carry rain or usher storm, but to add color to my sunset sky.",
    "tag": "Eternal Devotion"
  },
  {
    "id": 6,
    "author": "Paul Éluard",
    "authorNative": "Paul Éluard",
    "title": "Capital of Pain (Capitale de la douleur)",
    "era": "French Surrealist Master",
    "nativeQuote": "La courbe de tes yeux fait le tour de mon coeur...",
    "englishQuote": "The curve of your eyes makes the tour of my heart, a round of dance and sweetness, halo of time, cradle safe and sure.",
    "tag": "Curve of Eyes"
  },
  {
    "id": 7,
    "author": "Mahmoud Darwish",
    "authorNative": "محمود درويش",
    "title": "Memory for Forgetfulness",
    "era": "Palestinian Laureate",
    "nativeQuote": "إذا أردت أن تحب، فابدأ من عينيك...",
    "englishQuote": "If you wish to love, start by unlearning fear. Distance is only an invention of maps; the ink between our hands knows no borders.",
    "tag": "Uncharted Ink"
  },
  {
    "id": 8,
    "author": "Sukanta Bhattacharya",
    "authorNative": "সুকান্ত ভট্টাচার্য",
    "title": "Hey Mahajibon (হে মহাজীবন)",
    "era": "Rebel Lyricist",
    "nativeQuote": "ক্ষুধার রাজ্যে পৃথিবী গদ্যময়...",
    "englishQuote": "In the harsh reality of this world, your memory is the only verse that keeps poetry alive inside my soul.",
    "tag": "Verse in prose"
  },
  {
    "id": 9,
    "author": "Boris Pasternak",
    "authorNative": "Борис Пастернак",
    "title": "Doctor Zhivago (Lara's Theme)",
    "era": "Nobel Laureate, 1958",
    "nativeQuote": "Скрещенья рук, скрещенья ног, судьбы скрещенья...",
    "englishQuote": "You and I were created for one another, and we fell into each other's lives as simply as breathing. To lose you would be to cease belonging to the living.",
    "tag": "Crossing Fates"
  },
  {
    "id": 10,
    "author": "Nizar Qabbani",
    "authorNative": "نزار قباني",
    "title": "Love Poems of Damascus",
    "era": "Master of Arabic Romantic Lyricism",
    "nativeQuote": "أحبك حتى ترتفع السماء قليلاً، وحتى تجف البحار وتولد بحار...",
    "englishQuote": "My love for you is not a written book that can ever end. It is a language whose words are born anew every time your glance falls upon me.",
    "tag": "Unwritten Tale"
  },
  {
    "id": 11,
    "author": "Sunil Gangopadhyay",
    "authorNative": "সুনীল গঙ্গোপাধ্যায়",
    "title": "Keu Kotha Rakheni (কেউ কথা রাখেনি)",
    "era": "Modern Master of Kolkata Poetry",
    "nativeQuote": "কেউ কথা রাখেনি, তেত্রিশ বছর কাটলো, কেউ কথা রাখে না...",
    "englishQuote": "Thirty-three years have passed, yet no one kept their word. Still, I hold open the door of my heart, waiting for the letter that was never posted.",
    "tag": "Waiting Heart"
  },
  {
    "id": 12,
    "author": "Leonard Cohen",
    "authorNative": "Leonard Cohen",
    "title": "Anthem & Book of Longing",
    "era": "Poet-Singer-Songwriter",
    "nativeQuote": "Ring the bells that still can ring...",
    "englishQuote": "There is a crack, a crack in everything; that's how the light gets in. And you, my darling, are the light that chose to enter my darkest room.",
    "tag": "The Light Within"
  },
  {
    "id": 13,
    "author": "Faiz Ahmad Faiz",
    "authorNative": "فیض احمد فیض",
    "title": "Dast-e-Saba",
    "era": "Lenin Peace Prize Laureate",
    "nativeQuote": "مجھ سے پہلی سی محبت مری محبوب نہ مانگ...",
    "englishQuote": "Do not ask from me, my beloved, that same first love. Yet even when the sorrows of the world crowd upon me, your beauty remains an unshakable dawn.",
    "tag": "Sorrow & Splendor"
  },
  {
    "id": 14,
    "author": "Rabindranath Tagore",
    "authorNative": "রবীন্দ্রনাথ ঠাকুর",
    "title": "Shesher Kobita (শেষের কবিতা)",
    "era": "The Last Poem, 1929",
    "nativeQuote": "ভালবাসা প্রকাশের নাম নয়, ভালবাসা অনুভবের মহাসমুদ্র...",
    "englishQuote": "Love does not claim possession, but gives freedom. When you love, you do not merge two into one, but let two distinct souls dance in the same gentle wind.",
    "tag": "Infinite Grace"
  },
  {
    "id": 15,
    "author": "Lord Byron",
    "authorNative": "George Gordon Byron",
    "title": "She Walks in Beauty",
    "era": "1814 English Romantic Poetry",
    "nativeQuote": "She walks in beauty, like the night of cloudless climes and starry skies...",
    "englishQuote": "She walks in beauty, like the night of cloudless climes and starry skies; and all that's best of dark and bright meet in her aspect and her eyes.",
    "tag": "Night & Starlight"
  },
  {
    "id": 16,
    "author": "Hafez Shirazi",
    "authorNative": "حافظ شیرازی",
    "title": "Divan-e Hafez",
    "era": "14th-Century Master of Ghazals",
    "nativeQuote": "در ازل پرتو حسنت ز تجلی دم زد، عشق پیدا شد و آتش به همه عالم زد...",
    "englishQuote": "Even after all this time, the Sun never says to the Earth, 'You owe me.' Look what happens with a love like that — it lights the whole sky.",
    "tag": "Solar Devotion"
  },
  {
    "id": 17,
    "author": "Sunil Gangopadhyay",
    "authorNative": "সুনীল গঙ্গোপাধ্যায়",
    "title": "Smritir Shohor (স্মৃতির শহর)",
    "era": "Bengal Poet",
    "nativeQuote": "তুমি কি আজও তেমনি আছো, নাকি বদলে গেছে তোমার প্রিয় গানের সুর?",
    "englishQuote": "Are you still the same as when we parted, or has the melody of your favorite song gently changed with the passing of the seasons?",
    "tag": "Changing Seasons"
  },
  {
    "id": 18,
    "author": "Thomas Hardy",
    "authorNative": "Thomas Hardy",
    "title": "Tess of the d'Urbervilles & Poems of 1912-13",
    "era": "Victorian Realist",
    "nativeQuote": "Love is a possible strength in an actual weakness...",
    "englishQuote": "I have loved you with a love that outlasts the stars. When winter strip the trees bare, the roots underneath hold fast to one another in secret soil.",
    "tag": "Secret Roots"
  },
  {
    "id": 19,
    "author": "Jalāl al-Dīn Rūmī",
    "authorNative": "مولانا جلال‌الدین رومی",
    "title": "The Masnavi & Divan-e Shams",
    "era": "13th-Century Persian Mystic",
    "nativeQuote": "عشق آن شعله است که چو بر فروخت، هر چه جز معشوق باقی جمله سوخت...",
    "englishQuote": "Lovers don't finally meet somewhere. They are in each other all along. The minute I heard my first love story, I started looking for you, not knowing how blind that was.",
    "tag": "Soul Alignment"
  },
  {
    "id": 20,
    "author": "Helal Hafiz",
    "authorNative": "হেলাল হাফিজ",
    "title": "Je Jole Agun Jwole (যে জলে আগুন জ্বলে)",
    "era": "The Melancholic Romantic",
    "nativeQuote": "তোমাকে পাওয়ার জন্য এই জনমে কিছু তো একটা পাপ করা দরকার ছিল...",
    "englishQuote": "To have you in this lifetime, perhaps I needed to commit at least one sacred sin; otherwise, how could ordinary virtue ever earn such divine light?",
    "tag": "Sacred Longing"
  },
  {
    "id": 21,
    "author": "Alexander Pushkin",
    "authorNative": "Александр Пушкин",
    "title": "To Anna Kern (Я помню чудное мгновенье)",
    "era": "Russian Golden Age",
    "nativeQuote": "Я помню чудное мгновенье: передо мной явилась ты...",
    "englishQuote": "I recall a wondrous moment: before me you appeared, like a fleeting vision, like a spirit of pure beauty.",
    "tag": "Pure Vision"
  },
  {
    "id": 22,
    "author": "Rumi",
    "authorNative": "مولانا جلال‌الدین رومی",
    "title": "The Garden of the Beloved",
    "era": "Persian Mystic",
    "nativeQuote": "در عشق تو صد جهان پدید است...",
    "englishQuote": "This is love: to fly toward a secret sky, to cause a hundred veils to fall each moment. First to let go of life. Finally, to take a step without feet.",
    "tag": "Secret Sky"
  },
  {
    "id": 23,
    "author": "Rabindranath Tagore",
    "authorNative": "রবীন্দ্রনাথ ঠাকুর",
    "title": "Stray Birds (ক্ষণিকা)",
    "era": "Visva-Bharati, 1916",
    "nativeQuote": "আমার রাত পোহালো শারদ প্রাতে, বাঁশী, তোমায় দিয়ে যাব কার হাতে...",
    "englishQuote": "I seem to have loved you in numberless forms, numberless times, in life after life, in age after age forever.",
    "tag": "Immortal Cycle"
  },
  {
    "id": 24,
    "author": "Elizabeth Barrett Browning",
    "authorNative": "Elizabeth Barrett Browning",
    "title": "Sonnets from the Portuguese (Sonnet 43)",
    "era": "Victorian Era Master",
    "nativeQuote": "How do I love thee? Let me count the ways...",
    "englishQuote": "How do I love thee? Let me count the ways. I love thee to the depth and breadth and height my soul can reach, when feeling out of sight for the ends of being and ideal grace.",
    "tag": "Count the Ways"
  },
  {
    "id": 25,
    "author": "Mirza Ghalib",
    "authorNative": "مرزا اسد اللہ خان غالب",
    "title": "Diwan-e-Ghalib",
    "era": "Master of Urdu & Persian Ghazals",
    "nativeQuote": "عشق پر زور نہیں ہے یہ وہ آتش غالب، کہ لگائے نہ لگے اور بجھائے نہ بنے...",
    "englishQuote": "Love is beyond all human will, Ghalib — it is that mysterious flame which cannot be sparked by force, nor extinguished once it takes hold of the soul.",
    "tag": "Timeless Passion"
  },
  {
    "id": 26,
    "author": "Buddhadeb Basu",
    "authorNative": "বুদ্ধদেব বসু",
    "title": "Kallol Era Literature",
    "era": "Modernist Vanguard",
    "nativeQuote": "তোমার অস্তিত্বই আমার কাছে এক অনন্ত চিঠি, যা পড়তে পড়তে জীবন ফুরিয়ে যায়।",
    "englishQuote": "Your very existence is an endless handwritten letter, which I could spend my entire life reading without ever reaching the final line.",
    "tag": "Living Letter"
  },
  {
    "id": 27,
    "author": "Arthur Rimbaud",
    "authorNative": "Arthur Rimbaud",
    "title": "Illuminations",
    "era": "The Visionary Prodigy",
    "nativeQuote": "Elle est retrouvée. Quoi? L'Éternité. C'est la mer allée avec le soleil.",
    "englishQuote": "It has been found again. What? Eternity. It is the sea gone off with the sun. And within that infinite water, your glance is the beacon.",
    "tag": "Eternity"
  },
  {
    "id": 28,
    "author": "Parveen Shakir",
    "authorNative": "پروین شاکر",
    "title": "Khushbu (خوشبو - Fragrance)",
    "era": "The Fragrant Voice of Urdu Verse",
    "nativeQuote": "وہ تو خوشبو ہے ہواؤں میں بکھر جائے گا، مسئلہ پھول کا ہے پھول کدھر جائے گا...",
    "englishQuote": "He is like a perfume, destined to disperse into the wandering winds; my sorrow is for the petal left behind, trembling in the rain.",
    "tag": "Petal & Breeze"
  },
  {
    "id": 29,
    "author": "Jibanananda Das",
    "authorNative": "জীবনানন্দ দাশ",
    "title": "Banalata Sen (বনলতা সেন)",
    "era": "Pioneer of Modern Bengali Poetry",
    "nativeQuote": "হাজার বছর ধরে আমি পথ হাঁটিতেছি পৃথিবীর পথে... চুল তার কবেকার অন্ধকার বিদিশার নিশা, মুখ তার শ্রাবস্তীর কারুকার্য।",
    "englishQuote": "For thousands of years I have walked the lonely pathways of the earth... her hair was the dark night of ancient Vidisha, her face the delicate carved stone of Sravasti.",
    "tag": "Nocturnal Longing"
  },
  {
    "id": 30,
    "author": "Federico García Lorca",
    "authorNative": "Federico García Lorca",
    "title": "Gypsy Ballads (Romancero Gitano)",
    "era": "Andalusian Poet",
    "nativeQuote": "Verde que te quiero verde. Verde viento. Verdes ramas.",
    "englishQuote": "Green, how I want you green. Green wind. Green branches. The ship out on the sea and the horse on the mountain. With the shadow at the waist, she dreams upon her railing.",
    "tag": "Green Dreams"
  },
  {
    "id": 31,
    "author": "Kahlil Gibran",
    "authorNative": "جبران خليل جبران",
    "title": "The Prophet",
    "era": "Lebanese-American Literary Legend",
    "nativeQuote": "المحبة لا تعرف عمقها إلا ساعة الفراق...",
    "englishQuote": "Love knows not its own depth until the hour of separation. When you love, you should say not 'God is in my heart,' but rather, 'I am in the heart of God.'",
    "tag": "Divine Depth"
  },
  {
    "id": 32,
    "author": "Rabindranath Tagore",
    "authorNative": "রবীন্দ্রনাথ ঠাকুর",
    "title": "Purabi & Patraput",
    "era": "Bengal Renaissance",
    "nativeQuote": "তোমারে পেয়েছি আমি শুধু ক্ষণিকের তরে, তবু সে ক্ষণিকখানি অনন্তের সমান...",
    "englishQuote": "I have held you for only a fleeting moment, yet that single moment was wide enough to house all eternity.",
    "tag": "Fleeting Eternity"
  },
  {
    "id": 33,
    "author": "W.H. Auden",
    "authorNative": "Wystan Hugh Auden",
    "title": "Funeral Blues & Lullaby",
    "era": "20th-Century Anglo-American Titan",
    "nativeQuote": "Lay your sleeping head, my love, human on my faithless arm...",
    "englishQuote": "Lay your sleeping head, my love, human on my faithless arm; time and fevers burn away individual beauty from thoughtful children, and the grave proves the child ephemeral: but in my arms till break of day, let the living creature lie.",
    "tag": "Faithless Arm"
  },
  {
    "id": 34,
    "author": "Khalil Gibran",
    "authorNative": "جبران خليل جبران",
    "title": "Broken Wings (الأجنحة المتكسرة)",
    "era": "Early Arabic Romantic Masterpiece",
    "nativeQuote": "الحب الذي لا يتجدد كل يوم يتحول إلى عادة، والhabitude تتحول إلى عبودية...",
    "englishQuote": "Love that is not renewed day after day becomes a habit, and habit turns to captivity. But love born of mutual freedom is as endless as the dawn.",
    "tag": "Broken Wings"
  },
  {
    "id": 35,
    "author": "Kazi Nazrul Islam",
    "authorNative": "কাজী নজরুল ইসলাম",
    "title": "Dolon-Champa (দোলন-চাঁপা)",
    "era": "Rebel Poet of Bengal",
    "nativeQuote": "আমারে দেব না ভুলিতে, মোর সুর বাঁধিবে তোমার আঁখিজলে...",
    "englishQuote": "I shall not allow you to forget me; my melody will forever tie itself to the quiet tears in your eyes when the autumn twilight falls.",
    "tag": "Autumn Melody"
  },
  {
    "id": 36,
    "author": "Audre Lorde",
    "authorNative": "Audre Lorde",
    "title": "Uses of the Erotic",
    "era": "Poet-Philosopher",
    "nativeQuote": "When I dare to be powerful...",
    "englishQuote": "When we embrace our deep capacity for love, our work becomes an illumination, not a duty; a sanctuary, not an evasion.",
    "tag": "Inner Fire"
  },
  {
    "id": 37,
    "author": "Forugh Farrokhzad",
    "authorNative": "فروغ فرخزاد",
    "title": "Another Birth (تولدی دیگر)",
    "era": "Iconic Voice of Modern Persian Verse",
    "nativeQuote": "ای یار، ای یگانه ترین یار، چه ابرهای سیاهی در انتظار روز میهمانی خورشیدند...",
    "englishQuote": "I speak out of the deep of night, of the deep of darkness, and of the deep of night I speak. If you come to my house, friend, bring me a lamp and a window to look upon the crowd of the happy alley.",
    "tag": "The Dark Well"
  },
  {
    "id": 38,
    "author": "Helal Hafiz",
    "authorNative": "হেলাল হাফিজ",
    "title": "Oshlil Kobita & Nirbachito Kobita",
    "era": "The Heartbeat of Bengal Youth",
    "nativeQuote": "হৃদয় নিংড়ে দিয়েছি তোমায়, এখন আমি সম্পূর্ণ রিক্ত...",
    "englishQuote": "I have poured out the very marrow of my heart into your hands; now I am utterly destitute, and yet richer than all the emperors of the earth.",
    "tag": "Destitute & Rich"
  },
  {
    "id": 39,
    "author": "William Shakespeare",
    "authorNative": "William Shakespeare",
    "title": "Romeo and Juliet, Act II",
    "era": "The Bard",
    "nativeQuote": "My bounty is as boundless as the sea, my love as deep...",
    "englishQuote": "My bounty is as boundless as the sea, my love as deep; the more I give to thee, the more I have, for both are infinite.",
    "tag": "Infinite Bounty"
  },
  {
    "id": 40,
    "author": "Ahmad Faraz",
    "authorNative": "احمد فراز",
    "title": "Jana Jana",
    "era": "Contemporary Master of Romance",
    "nativeQuote": "سنا ہے لوگ اسے آنکھ بھر کے دیکھتے ہیں، سو اس کے شہر میں کچھ دن ٹھہر کے دیکھتے ہیں...",
    "englishQuote": "They say when she passes, even the shadows turn to gaze. So let me stay a few days more in her city, just to witness how the world softens at her footsteps.",
    "tag": "Enchanted City"
  },
  {
    "id": 41,
    "author": "Humayun Azad",
    "authorNative": "হুমায়ুন আজাদ",
    "title": "Shob Kisu Bhenge Pore (সব কিছু ভেঙে পড়ে)",
    "era": "Rebel Linguist & Poet",
    "nativeQuote": "সবাইকে বিশ্বাস করা যায় না, কিন্তু কাউকে অন্ধভাবে না ভালোবাসলে জীবনের সৌন্দর্য বোঝা যায় না।",
    "englishQuote": "One cannot trust the whole world, yet without loving someone with blind surrender, the secret beauty of existence remains undiscovered.",
    "tag": "Blind Faith"
  },
  {
    "id": 42,
    "author": "Octavio Paz",
    "authorNative": "Octavio Paz",
    "title": "Sunstone (Piedra de Sol)",
    "era": "Mexican Nobel Laureate, 1990",
    "nativeQuote": "El mundo nace cuando dos se besan...",
    "englishQuote": "The world is born anew each time two lovers kiss. Transparent walls dissolve, and time itself stands still to listen to their breath.",
    "tag": "Cosmic Kiss"
  },
  {
    "id": 43,
    "author": "Jaun Elia",
    "authorNative": "جون ایلیا",
    "title": "Shayad (شاید)",
    "era": "The Philosophy of Heartbreak",
    "nativeQuote": "یہ مجھے چین کیوں نہیں پڑتا، ایک ہی شخص تھا جہاں میں کیا...",
    "englishQuote": "Why does peace elude my soul at every hour? Was there truly only one person in all of existence whose absence could empty the entire universe?",
    "tag": "Empty Universe"
  },
  {
    "id": 44,
    "author": "Nirmalendu Goon",
    "authorNative": "নির্মলেন্দু গুণ",
    "title": "Hulya & Other Poems",
    "era": "People's Lyricist",
    "nativeQuote": "ভালবাসা মানে অনন্তকাল ধরে পথ চেয়ে বসে থাকা, ভালবাসা মানে একটিমাত্র দীর্ঘশ্বাস...",
    "englishQuote": "Love is waiting through eternity on an empty shore; love is that single, quiet breath where your name is inscribed forever.",
    "tag": "Fierce Devotion"
  },
  {
    "id": 45,
    "author": "Gabriela Mistral",
    "authorNative": "Gabriela Mistral",
    "title": "Sonnets of Death & Desolation",
    "era": "First Latin American Nobel Laureate, 1945",
    "nativeQuote": "Besar con la mirada es la más bella forma de besar...",
    "englishQuote": "To kiss with a glance is the purest form of kissing; it leaves no mark on the skin, yet marks the soul for eternity.",
    "tag": "Silent Kiss"
  },
  {
    "id": 46,
    "author": "Attar of Nishapur",
    "authorNative": "فریدالدین عطار نیشابوری",
    "title": "The Conference of the Birds",
    "era": "12th-Century Persian Mystic",
    "nativeQuote": "عشق جز با جان عاشق همدمی کی کند؟...",
    "englishQuote": "Love is a fire that consumes everything except the beloved. In the mirror of the beloved, the seeker finds only their own true face.",
    "tag": "Mirror of Souls"
  },
  {
    "id": 47,
    "author": "Kazi Nazrul Islam",
    "authorNative": "কাজী নজরুল ইসলাম",
    "title": "The Rebel & Romantic Bard",
    "era": "National Poet of Bengal",
    "nativeQuote": "তুমি সুন্দর তাই চেয়ে থাকি প্রিয়, সে কি মোর অপরাধ? চাঁদেরে হেরিয়া কাঁদে চকোরিণী বলে না তো কিছু চাঁদ।",
    "englishQuote": "You are breathtakingly beautiful, so I gaze upon you, my beloved — is that my sin? The night bird weeps for the distant moon, yet the moon utters not a solitary word of blame.",
    "tag": "Untamed Passion"
  },
  {
    "id": 48,
    "author": "Federico García Lorca",
    "authorNative": "Federico García Lorca",
    "title": "Sonnets of Dark Love (Sonetos del amor oscuro)",
    "era": "Generation of '27, Spain",
    "nativeQuote": "Tengo miedo a perder la maravilla de tus ojos de estatua y el acento...",
    "englishQuote": "I am afraid to lose the miracle of your eyes like statues and the night-accent your solitude leaves upon my cheek.",
    "tag": "Dark Love"
  },
  {
    "id": 49,
    "author": "Saadi Shirazi",
    "authorNative": "سعدی شیرازی",
    "title": "Gulistan & Bustan",
    "era": "13th-Century Persian Sage",
    "nativeQuote": "تن آدمی شریف است به جان آدمیت...",
    "englishQuote": "If the fragrance of your hair is carried by the dawn breeze, it brings back to life every heart that had withered in grief.",
    "tag": "Morning Breeze"
  },
  {
    "id": 50,
    "author": "Jibanananda Das",
    "authorNative": "জীবনানন্দ দাশ",
    "title": "Kavitar Katha & Dhusar Pandulipi",
    "era": "Modernist Master of Bengal",
    "nativeQuote": "সব পাখি ঘরে আসে—সব নদী—ফুরায় এ-জীবনের সব লেনদেন; থাকে শুধু অন্ধকার, মুখোমুখি বসিবার বনলতা সেন।",
    "englishQuote": "All birds return to their nests, all rivers end, and all debts of this life are paid; only darkness remains, and sitting face to face, Banalata Sen.",
    "tag": "Face to Face"
  },
  {
    "id": 51,
    "author": "Alexander Pushkin",
    "authorNative": "Александр Пушкин",
    "title": "I Loved You (Я вас любил)",
    "era": "Father of Modern Russian Literature",
    "nativeQuote": "Я вас любил: любовь еще, быть может, в душе моей угасла не совсем...",
    "englishQuote": "I loved you: and the love, I wish to believe, is not quite extinguished in my heart. But let it cause you no more grief; I would not sadden you with anything.",
    "tag": "Silent Flame"
  },
  {
    "id": 52,
    "author": "Faiz Ahmad Faiz",
    "authorNative": "فیض احمد فیض",
    "title": "Nuskha-hae-Wafa",
    "era": "Urdu Literature Landmark",
    "nativeQuote": "رات یوں دل میں تری کھوئی ہوئی یاد آئی...",
    "englishQuote": "Last night your forgotten memory drifted into my heart, as quietly as spring arrives unannounced in an abandoned garden.",
    "tag": "Quiet Spring"
  },
  {
    "id": 53,
    "author": "Shamsur Rahman",
    "authorNative": "শামসুর রাহমান",
    "title": "Tomake Pawar Jonno, Hey Swadhinata",
    "era": "Voice of Dhaka Modernism",
    "nativeQuote": "তোমার মুখের দিকে চাইলে মনে হয় পৃথিবীর সমস্ত নদী এসে মিলেছে তোমার চোখের মোহনায়।",
    "englishQuote": "Whenever I look into your face, it feels as though all the silent rivers of the world have gathered at the delta of your eyes.",
    "tag": "Deep Water"
  },
  {
    "id": 54,
    "author": "Petrarch",
    "authorNative": "Francesco Petrarca",
    "title": "Canzoniere (Songbook for Laura)",
    "era": "Father of Humanism",
    "nativeQuote": "Benedetto sia 'l giorno, e 'l mese, et l'anno...",
    "englishQuote": "Blessed be the day, and the month, and the year, and the season, and the hour, and the very moment, and the lovely country, and the place where I was overtaken by those two enchanting eyes.",
    "tag": "Blessed Moment"
  },
  {
    "id": 55,
    "author": "Omar Khayyam",
    "authorNative": "عمر خیام",
    "title": "Rubaiyat of Omar Khayyam",
    "era": "11th-Century Astronomer-Poet",
    "nativeQuote": "گر دست دهد ز مغز گندم نانی، وز می دو منی ز گوسفندی رانی...",
    "englishQuote": "A Book of Verses underneath the Bough, a Jug of Wine, a Loaf of Bread — and Thou beside me singing in the Wilderness — Oh, Wilderness were Paradise enow!",
    "tag": "The Wilderness"
  },
  {
    "id": 56,
    "author": "Michael Madhusudan Dutt",
    "authorNative": "মাইকেল মধুসূদন দত্ত",
    "title": "Meghnad Badh Kavya & Sonnets",
    "era": "Pioneer of Bengali Blank Verse",
    "nativeQuote": "রেখো, মা, দাসেরে মনে, এ মিনতি করি পদে...",
    "englishQuote": "Remember this devoted servant, I pray at your feet — for wherever the currents of destiny carry me, my thoughts remain tethered to your shadow.",
    "tag": "Devoted Soul"
  },
  {
    "id": 57,
    "author": "Mario Benedetti",
    "authorNative": "Mario Benedetti",
    "title": "Táctica y Estrategia",
    "era": "Uruguayan Literary Icon",
    "nativeQuote": "Mi táctica es mirarte, aprender como sos, quererte como sos...",
    "englishQuote": "My tactic is to look at you, to learn who you are, to love you as you are. My strategy is simpler: that one ordinary day, you will find you cannot do without me.",
    "tag": "Gentle Strategy"
  },
  {
    "id": 58,
    "author": "Nizar Qabbani",
    "authorNative": "نزار قباني",
    "title": "On the Margins of the Notebook",
    "era": "Damascus Romantic",
    "nativeQuote": "كلما فكرت فيكِ، أزهرت في صدري حديقة...",
    "englishQuote": "Whenever I think of you, a hidden garden blossoms inside my chest. Even during the longest winter, your name carries the scent of jasmine.",
    "tag": "Scent of Jasmine"
  },
  {
    "id": 59,
    "author": "Sukanta Bhattacharya",
    "authorNative": "সুকান্ত ভট্টাচার্য",
    "title": "Chharpatra (ছাড়পত্র)",
    "era": "The Youthful Fire",
    "nativeQuote": "পূর্ণিমা চাঁদ যেন ঝলসানো রুটি...",
    "englishQuote": "Even amidst the harsh winds of this world, the thought of your touch remains the only sanctuary that softens the night.",
    "tag": "Tender Flame"
  },
  {
    "id": 60,
    "author": "Jorge Luis Borges",
    "authorNative": "Jorge Luis Borges",
    "title": "The Threatened One (El Amenazado)",
    "era": "Argentine Literary Maestro",
    "nativeQuote": "Estar contigo o no estar contigo es la medida de mi tiempo...",
    "englishQuote": "Being with you or not being with you is the only measure of my time. The rest of the clock is merely noise.",
    "tag": "Measure of Time"
  },
  {
    "id": 61,
    "author": "Jalāl al-Dīn Rūmī",
    "authorNative": "مولانا جلال‌الدین رومی",
    "title": "The Essential Rumi",
    "era": "Sufi Master",
    "nativeQuote": "ز خاک من اگر گندم برآید، از آن گر نان پزی مستی فزاید...",
    "englishQuote": "Out beyond ideas of wrongdoing and rightdoing there is a field. I'll meet you there. When the soul lies down in that grass the world is too full to talk about.",
    "tag": "The Open Field"
  },
  {
    "id": 62,
    "author": "Jasimuddin",
    "authorNative": "জসীমউদ্দীন",
    "title": "Nakshi Kanthar Math (নকশী কাঁথার মাঠ)",
    "era": "The Pastoral Balladeer",
    "nativeQuote": "সুজন রে তোর বিরহ-গাথা এই কাঁথাতে আঁকা, চোখের জলে রঙ গুলেছি, বুকে পরাণ রাখা।",
    "englishQuote": "In every stitch of this embroidered quilt lies the sorrow of separation, dyed with the color of sleepless tears and the quiet beating of a faithful heart.",
    "tag": "Folk Romance"
  },
  {
    "id": 63,
    "author": "Emily Brontë",
    "authorNative": "Emily Brontë",
    "title": "Wuthering Heights",
    "era": "Victorian Gothic Romance",
    "nativeQuote": "Whatever our souls are made of, his and mine are the same...",
    "englishQuote": "Whatever our souls are made of, his and mine are the same. If all else perished and he remained, I should still continue to be; and if all else remained and he were annihilated, the universe would turn to a mighty stranger.",
    "tag": "Single Soul"
  },
  {
    "id": 64,
    "author": "Hafez Shirazi",
    "authorNative": "حافظ شیرازی",
    "title": "Odes to the Divine Friend",
    "era": "Persian Mystic",
    "nativeQuote": "هرگز نمیرد آن که دلش زنده شد به عشق...",
    "englishQuote": "Never will they die whose heart has come alive through love. Our immortality is written in the grand ledger of the heavens.",
    "tag": "Living Heart"
  },
  {
    "id": 65,
    "author": "Victor Hugo",
    "authorNative": "Victor Hugo",
    "title": "Les Misérables & Letters to Adèle Foucher",
    "era": "Giant of French Romanticism",
    "nativeQuote": "Aimer, c'est savoir dire je t'aime sans parler...",
    "englishQuote": "The greatest happiness of life is the conviction that we are loved; loved for ourselves, or rather, loved in spite of ourselves.",
    "tag": "In Spite of All"
  },
  {
    "id": 66,
    "author": "Allama Iqbal",
    "authorNative": "علامہ محمد اقبال",
    "title": "Bang-e-Dra",
    "era": "Poet of the East",
    "nativeQuote": "ستاروں سے آگے جہاں اور بھی ہیں، ابھی عشق کے امتحاں اور بھی ہیں...",
    "englishQuote": "Beyond the distant stars are other realms yet unexplored; the journey of love knows no horizon and no final frontier.",
    "tag": "Infinite Horizons"
  },
  {
    "id": 67,
    "author": "Robert Burns",
    "authorNative": "Robert Burns",
    "title": "A Red, Red Rose",
    "era": "National Bard of Scotland",
    "nativeQuote": "O my Luve is like a red, red rose that's newly sprung in June...",
    "englishQuote": "O my Luve is like a red, red rose that's newly sprung in June: O my Luve is like the melody that's sweetly played in tune. As fair art thou, my bonnie lass, so deep in luve am I; and I will luve thee still, my dear, till a' the seas gang dry.",
    "tag": "Red Rose"
  },
  {
    "id": 68,
    "author": "William Shakespeare",
    "authorNative": "William Shakespeare",
    "title": "Sonnet 116",
    "era": "Elizabethan Era",
    "nativeQuote": "Let me not to the marriage of true minds admit impediments...",
    "englishQuote": "Love is not love which alters when it alteration finds, or bends with the remover to remove. O no! it is an ever-fixed mark that looks on tempests and is never shaken.",
    "tag": "Ever-Fixed Mark"
  },
  {
    "id": 69,
    "author": "Oscar Wilde",
    "authorNative": "Oscar Wilde",
    "title": "De Profundis & Letters",
    "era": "Victorian Wit & Dramatist",
    "nativeQuote": "Where there is sorrow there is holy ground...",
    "englishQuote": "You are the one who showed me the difference between existing and truly living. A flower cannot blossom without sunshine, and man cannot live without love.",
    "tag": "Holy Ground"
  },
  {
    "id": 70,
    "author": "William Shakespeare",
    "authorNative": "William Shakespeare",
    "title": "Hamlet, Act II, Scene 2",
    "era": "The Bard of Avon",
    "nativeQuote": "Doubt thou the stars are fire; Doubt that the sun doth move...",
    "englishQuote": "Doubt thou the stars are fire; Doubt that the sun doth move; Doubt truth to be a liar; But never doubt I love.",
    "tag": "Unshakable Vow"
  },
  {
    "id": 71,
    "author": "Christina Rossetti",
    "authorNative": "Christina Rossetti",
    "title": "A Birthday",
    "era": "Pre-Raphaelite Brotherhood Era",
    "nativeQuote": "My heart is like a singing bird whose nest is in a water'd shoot...",
    "englishQuote": "My heart is like a singing bird whose nest is in a water'd shoot; my heart is like an apple-tree whose boughs are bent with thickset fruit; my heart is gladder than all these because my love is come to me.",
    "tag": "Singing Bird"
  },
  {
    "id": 72,
    "author": "Jane Austen",
    "authorNative": "Jane Austen",
    "title": "Persuasion, Letter from Captain Wentworth",
    "era": "Regency England",
    "nativeQuote": "You pierce my soul. I am half agony, half hope...",
    "englishQuote": "You pierce my soul. I am half agony, half hope. Tell me not that I am too late, that such precious feelings are gone for ever. I offer myself to you again with a heart even more your own than when you almost broke it.",
    "tag": "Agony & Hope"
  },
  {
    "id": 73,
    "author": "Marina Tsvetaeva",
    "authorNative": "Марина Цветаева",
    "title": "Poems to Blok & Letters",
    "era": "Russian Silver Age",
    "nativeQuote": "Мне нравится, что вы больны не мной...",
    "englishQuote": "In this world where everyone seeks to possess, thank you for loving the freedom within my chest as deeply as you love my heartbeat.",
    "tag": "Wild Freedom"
  },
  {
    "id": 74,
    "author": "W.B. Yeats",
    "authorNative": "William Butler Yeats",
    "title": "When You Are Old",
    "era": "Irish Nobel Laureate, 1923",
    "nativeQuote": "How many loved your moments of glad grace, and loved your beauty with love false or true...",
    "englishQuote": "How many loved your moments of glad grace, and loved your beauty with love false or true, but one man loved the pilgrim soul in you, and loved the sorrows of your changing face.",
    "tag": "Pilgrim Soul"
  },
  {
    "id": 75,
    "author": "Heinrich Heine",
    "authorNative": "Heinrich Heine",
    "title": "Book of Songs (Buch der Lieder)",
    "era": "German Lyricist",
    "nativeQuote": "Du bist wie eine Blume, so hold und schön und rein...",
    "englishQuote": "Thou art even as a flower, so gentle, pure, and fair; I gaze on thee, and sorrow steals over me unaware. I feel as if I ought to lay my hands upon thy head, praying that God may keep thee so gentle, pure, and fair.",
    "tag": "Gentle Flower"
  },
  {
    "id": 76,
    "author": "Pablo Neruda",
    "authorNative": "Pablo Neruda",
    "title": "Twenty Love Poems and a Song of Despair",
    "era": "Chile, 1924",
    "nativeQuote": "Quiero hacer contigo lo que la primavera hace con los cerezos.",
    "englishQuote": "I want to do with you what spring does with the cherry trees — awaken every sleeping branch into sudden, blossoming light.",
    "tag": "Spring Blossom"
  },
  {
    "id": 77,
    "author": "Charles Baudelaire",
    "authorNative": "Charles Baudelaire",
    "title": "Invitation to the Voyage (L'Invitation au voyage)",
    "era": "French Symbolism",
    "nativeQuote": "Là, tout n'est qu'ordre et beauté, luxe, calme et volupté.",
    "englishQuote": "My child, my sister, dream how sweet it would be to go down there and live together! To love at leisure, to love and die in the land that resembles you!",
    "tag": "The Promised Land"
  },
  {
    "id": 78,
    "author": "Emily Dickinson",
    "authorNative": "Emily Dickinson",
    "title": "Complete Poems (Poem 656)",
    "era": "The Belle of Amherst",
    "nativeQuote": "That Love is all there is, is all we know of Love...",
    "englishQuote": "That Love is all there is, is all we know of Love; it is enough, the freight should be proportioned to the groove.",
    "tag": "All There Is"
  },
  {
    "id": 79,
    "author": "William Wordsworth",
    "authorNative": "William Wordsworth",
    "title": "Lyrical Ballads",
    "era": "English Romanticism Pioneer",
    "nativeQuote": "She was a phantom of delight when first she gleam'd upon my sight...",
    "englishQuote": "She was a phantom of delight when first she gleam'd upon my sight; a lovely apparition, sent to be a moment's ornament; her eyes as stars of twilight fair; like twilight's, too, her dusky hair.",
    "tag": "Twilight Fair"
  },
  {
    "id": 80,
    "author": "John Keats",
    "authorNative": "John Keats",
    "title": "Bright Star, Would I Were Stedfast as Thou Art",
    "era": "English Romantics",
    "nativeQuote": "Pillow'd upon my fair love's ripening breast, to feel for ever its soft fall and swell...",
    "englishQuote": "Pillow'd upon my fair love's ripening breast, to feel for ever its soft fall and swell, awake for ever in a sweet unrest, still, still to hear her tender-taken breath, and so live ever — or else swoon to death.",
    "tag": "Sweet Unrest"
  },
  {
    "id": 81,
    "author": "Anna Akhmatova",
    "authorNative": "Анна Ахматова",
    "title": "Evening & Requiem",
    "era": "The Soul of St. Petersburg",
    "nativeQuote": "И таинственный песенный дар...",
    "englishQuote": "There is a sacred frontier that love cannot cross, though passion tear the heart in two. On the other side of that silence, our true story begins.",
    "tag": "Sacred Frontier"
  },
  {
    "id": 82,
    "author": "Pablo Neruda",
    "authorNative": "Pablo Neruda",
    "title": "100 Love Sonnets (Sonnet XVII)",
    "era": "Chilean Poet-Diplomat, 1971 Nobel Prize",
    "nativeQuote": "Te amo sin saber cómo, ni cuándo, ni de dónde. Te amo directamente sin problemas ni orgullo...",
    "englishQuote": "I love you without knowing how, or when, or from where. I love you simply, without problems or pride: I love you in this way because I do not know any other way of loving.",
    "tag": "Pure Longing"
  },
  {
    "id": 83,
    "author": "Pablo Neruda",
    "authorNative": "Pablo Neruda",
    "title": "The Captain's Verses (Los versos del capitán)",
    "era": "Chilean Master",
    "nativeQuote": "Si tú me olvidas, te olvidaré. Pero si cada día, cada hora sientes que a mí estás destinada...",
    "englishQuote": "If suddenly you forget me, do not look for me, for I shall already have forgotten you. But if each day, each hour, you feel that you are destined for me with sweet relentlessness, then within me not one spark is extinguished.",
    "tag": "Sweet Relentlessness"
  },
  {
    "id": 84,
    "author": "Edgar Allan Poe",
    "authorNative": "Edgar Allan Poe",
    "title": "Annabel Lee",
    "era": "American Gothic Master",
    "nativeQuote": "We loved with a love that was more than love...",
    "englishQuote": "We loved with a love that was more than love — I and my Annabel Lee — with a love that the winged seraphs of Heaven coveted her and me.",
    "tag": "More Than Love"
  },
  {
    "id": 85,
    "author": "Paul Verlaine",
    "authorNative": "Paul Verlaine",
    "title": "Romances sans paroles",
    "era": "Symbolist Master of Melody",
    "nativeQuote": "Il pleure dans mon coeur comme il pleut sur la ville...",
    "englishQuote": "Tears fall in my heart like rain upon the sleeping town; yet when your letter arrives, every drop turns into a spark of sunlit dew.",
    "tag": "Sunlit Dew"
  },
  {
    "id": 86,
    "author": "Yosano Akiko",
    "authorNative": "与謝野 晶子",
    "title": "Midaregami (Tangled Hair, 1901)",
    "era": "Pioneer of Modern Japanese Romance",
    "nativeQuote": "その子二十櫛にながるる黒髪のおごりの春のうつくしきかな",
    "englishQuote": "You never touch my soft black hair, nor feel the wild spring coursing through my blood; are you not lonely, traveler of the sacred path, walking alone without love?",
    "tag": "Tangled Hair"
  },
  {
    "id": 87,
    "author": "Johann Wolfgang von Goethe",
    "authorNative": "Johann Wolfgang von Goethe",
    "title": "Faust & The Sorrows of Young Werther",
    "era": "Weimar Classicism",
    "nativeQuote": "Das Ewig-Weibliche zieht uns hinan...",
    "englishQuote": "If I love you, what business is that of yours? My love belongs to the stars that look down on you, quiet and unasking.",
    "tag": "Starry Love"
  },
  {
    "id": 88,
    "author": "Charles Baudelaire",
    "authorNative": "Charles Baudelaire",
    "title": "Les Fleurs du mal (The Flowers of Evil)",
    "era": "French Symbolist Pioneer",
    "nativeQuote": "Ton souvenir en moi luit comme un ostensoir...",
    "englishQuote": "Your memory shines within my dark chambers like a sacred monstrance. In you alone does my restless wandering find its quiet church.",
    "tag": "Sacred Relic"
  },
  {
    "id": 89,
    "author": "Emily Dickinson",
    "authorNative": "Emily Dickinson",
    "title": "Wild Nights - Wild Nights! (Poem 269)",
    "era": "American Lyricist",
    "nativeQuote": "Rowing in Eden - Ah, the Sea! Might I but moor - tonight - In thee!",
    "englishQuote": "Wild nights - Wild nights! Were I with thee, wild nights should be our luxury! Futile the winds to a heart in port, done with the compass - done with the chart! Rowing in Eden - Ah, the sea! Might I but moor - tonight - in thee!",
    "tag": "Rowing in Eden"
  },
  {
    "id": 90,
    "author": "Matsuo Bashō",
    "authorNative": "松尾 芭蕉",
    "title": "The Narrow Road to the Deep North",
    "era": "Edo Period Master of Haiku",
    "nativeQuote": "旅人と我が名呼ばれん初時雨",
    "englishQuote": "Even in Kyoto, hearing the cuckoo's cry, I long for Kyoto. Even holding you close, my heart longs for you still.",
    "tag": "Endless Longing"
  },
  {
    "id": 91,
    "author": "Percy Bysshe Shelley",
    "authorNative": "Percy Bysshe Shelley",
    "title": "Love's Philosophy",
    "era": "Romantic Visionary",
    "nativeQuote": "The fountains mingle with the river and the rivers with the ocean...",
    "englishQuote": "The fountains mingle with the river and the rivers with the ocean, the winds of heaven mix for ever with a sweet emotion; nothing in the world is single; all things by a law divine in one spirit meet and mingle. Why not I with thine?",
    "tag": "Cosmic Union"
  },
  {
    "id": 92,
    "author": "E.E. Cummings",
    "authorNative": "Edward Estlin Cummings",
    "title": "Complete Poems 1904-1962",
    "era": "American Avant-Garde Lyricist",
    "nativeQuote": "i carry your heart with me (i carry it in my heart)...",
    "englishQuote": "i carry your heart with me (i carry it in my heart) i am never without it (anywhere i go you go, my dear; and whatever is done by only me is your doing, my darling).",
    "tag": "Carry Your Heart"
  },
  {
    "id": 93,
    "author": "Antoine de Saint-Exupéry",
    "authorNative": "Antoine de Saint-Exupéry",
    "title": "The Little Prince (Le Petit Prince)",
    "era": "French Aviator & Philosopher",
    "nativeQuote": "On ne voit bien qu'avec le coeur. L'essentiel est invisible pour les yeux.",
    "englishQuote": "It is only with the heart that one can see rightly; what is essential is invisible to the eye. It is the time you have wasted for your rose that makes your rose so important.",
    "tag": "The Golden Rose"
  },
  {
    "id": 94,
    "author": "Mary Oliver",
    "authorNative": "Mary Oliver",
    "title": "Devotions & Wild Geese",
    "era": "Pulitzer Prize for Poetry",
    "nativeQuote": "You do not have to be good...",
    "englishQuote": "You only have to let the soft animal of your body love what it loves. Tell me your despair, yours, and I will tell you mine, while the world goes on.",
    "tag": "Soft Devotion"
  },
  {
    "id": 95,
    "author": "Marcel Proust",
    "authorNative": "Marcel Proust",
    "title": "In Search of Lost Time (À la recherche du temps perdu)",
    "era": "French Modernist Landmark",
    "nativeQuote": "Les vrais paradis sont les paradis qu'on a perdus...",
    "englishQuote": "When we are in love, we do not discover someone else; we discover the missing sanctuary of our own forgotten soul.",
    "tag": "Lost Paradise"
  },
  {
    "id": 96,
    "author": "John Keats",
    "authorNative": "John Keats",
    "title": "Letter to Fanny Brawne, October 1819",
    "era": "English Romanticism Poet",
    "nativeQuote": "My love has made me selfish. I cannot exist without you...",
    "englishQuote": "I cannot exist without you. I am forgetful of everything but seeing you again — my life seems to stop there, I see no further. You have absorb'd me.",
    "tag": "Absorbed in You"
  },
  {
    "id": 97,
    "author": "Maya Angelou",
    "authorNative": "Maya Angelou",
    "title": "Touched by an Angel",
    "era": "Voice of Courage & Grace",
    "nativeQuote": "Love arrives and in its train come ecstasies...",
    "englishQuote": "Love arrives and in its train come ecstasies, old memories of pleasure, ancient histories of pain. Yet if we are bold, love strikes away the chains of fear from our souls.",
    "tag": "Chains of Fear"
  },
  {
    "id": 98,
    "author": "Rainer Maria Rilke",
    "authorNative": "Rainer Maria Rilke",
    "title": "Letters to a Young Poet",
    "era": "Austrian Master of Modern Poetry",
    "nativeQuote": "Für einen Menschen ist die Liebe wohl das Schwerste...",
    "englishQuote": "Love consists of this: two solitudes that meet, protect and greet each other. To love is good, too: for love is difficult.",
    "tag": "Two Solitudes"
  },
  {
    "id": 99,
    "author": "Dante Alighieri",
    "authorNative": "Dante Alighieri",
    "title": "The Divine Comedy (Paradiso, XXXIII)",
    "era": "Father of the Italian Language",
    "nativeQuote": "L'amor che move il sole e l'altre stelle...",
    "englishQuote": "Here vigor failed the lofty fantasy: but already my desire and my will were rolled, even as a wheel that moveth equally, by the Love that moves the sun and the other stars.",
    "tag": "Cosmic Mover"
  },
  {
    "id": 100,
    "author": "Walt Whitman",
    "authorNative": "Walt Whitman",
    "title": "Leaves of Grass",
    "era": "The Bard of Democracy",
    "nativeQuote": "We two boys together clinging, one the other never leaving...",
    "englishQuote": "I am large, I contain multitudes. Yet all my wandering currents turn toward you, as rivers inexorably seek the sea.",
    "tag": "Endless Sea"
  },
  {
    "id": 101,
    "author": "Lord Alfred Tennyson",
    "authorNative": "Alfred Tennyson",
    "title": "In Memoriam A.H.H.",
    "era": "Poet Laureate of Great Britain",
    "nativeQuote": "'Tis better to have loved and lost than never to have loved at all...",
    "englishQuote": "I hold it true, whate'er befall; I feel it, when I sorrow most; 'tis better to have loved and lost than never to have loved at all.",
    "tag": "Noble Grief"
  },
  {
    "id": 102,
    "author": "Victor Hugo",
    "authorNative": "Victor Hugo",
    "title": "Les Chansons des rues et des bois",
    "era": "France, 19th Century",
    "nativeQuote": "Qu'est-ce que mourir? C'est aimer sans espoir.",
    "englishQuote": "What is death? It is to live without hope. But to love is to have already conquered the dark before the evening arrives.",
    "tag": "Conquering Dark"
  },
  {
    "id": 103,
    "author": "Sappho of Lesbos",
    "authorNative": "Σαπφώ",
    "title": "Fragments of Sappho",
    "era": "Archaic Greece, 6th Century BCE",
    "nativeQuote": "φαίνεταί μοι κῆνος ἴσος θέοισιν...",
    "englishQuote": "He seems to me equal to the gods, that man who sits opposite you and listens closely to your sweet speech and your lovely laughter, which has set my heart fluttering in my breast.",
    "tag": "Equal to Gods"
  },
  {
    "id": 104,
    "author": "Rainer Maria Rilke",
    "authorNative": "Rainer Maria Rilke",
    "title": "Book of Hours: Love Poems to God",
    "era": "Bohemian-Austrian Poet",
    "nativeQuote": "Ich lebe mein Leben in wachsenden Ringen...",
    "englishQuote": "I live my life in widening circles that reach out across the world. I may not complete this last one, but I will give myself to it entirely.",
    "tag": "Widening Circles"
  },
  {
    "id": 105,
    "author": "Langston Hughes",
    "authorNative": "Langston Hughes",
    "title": "Harlem Renaissance Lyricism",
    "era": "Leader of Harlem Renaissance",
    "nativeQuote": "Hold fast to dreams...",
    "englishQuote": "I loved my friend. He went away from me. There's nothing more to say. The poem ends, soft as it began — I loved my friend.",
    "tag": "Quiet Truth"
  }
];
