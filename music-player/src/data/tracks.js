const tracks = [
    {
      id: 1,
      title: "Like I Love You",
      artist: "Justin Timberlake",
      genre: "Pop",
      coverPath: "/assets/covers/300x300.jpg",
      audioPath: "/assets/music/Justin Timberlake - Like I Love You.mp3"
    },
    {
      id: 2,
      title: "Respect",
      artist: "The Notorious B.I.G․",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/B.I.G.jpg",
      audioPath: "/assets/music/The Notorious B.I.G․ - Respect.mp3"
    },
    {
      id: 3,
      title: "Somebody to Love",
      artist: "Queen",
      genre: "Rock",
      coverPath: "/assets/covers/queen.jpg",
      audioPath: "/assets/music/Queen - Somebody To Love.mp3"
    },
    {
      id: 4,
      title: "Rather Lie",
      artist: "Playboi Carti",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/carti.jpg",
      audioPath: "/assets/music/Playboi Carti - RATHER LIE.mp3"
    },
    {
      id: 5,
      title: "Señorita",
      artist: "Justin Timberlake",
      genre: "Pop",
      coverPath: "/assets/covers/300x300.jpg",
      audioPath: "/assets/music/Justin Timberlake - Señorita.mp3"
    },
    {
      id: 6,
      title: "Windows Down",
      artist: "Big Time Rush",
      genre: "Pop",
      coverPath: "/assets/covers/btr.jpg",
      audioPath: "/assets/music/Big Time Rush - Windows Down.mp3"
    },
    {
      id: 7,
      title: "No More?",
      artist: "Eazy-E",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/eazy.jpg",
      audioPath: "/assets/music/Eazy-E - No More 's.mp3"
    },
    {
      id: 8,
      title: "Good Credit",
      artist: "Playboi Carti",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/carti.jpg",
      audioPath: "/assets/music/Playboi-Carti-GOOD-CREDIT.mp3"
    },
    {
      id: 9,
      title: "Gimme the Loot",
      artist: "The Notorious B.I.G.",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/B.I.G.jpg",
      audioPath: "/assets/music/The Notorious B.I.G․ - Gimme the Loot.mp3"
    },
    {
      id: 10,
      title: "Rock Your Body",
      artist: "Justin Timberlake",
      genre: "Pop",
      coverPath: "/assets/covers/300x300.jpg",
      audioPath: "/assets/music/Justin Timberlake - Rock Your Body.mp3"
    },
    {
      id: 11,
      title: "I Wonder",
      artist: "Kanye West",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/kanye.jpg",
      audioPath: "/assets/music/Kanye West - I Wonder.mp3"
    },
    {
      id: 12,
      title: "PRIDE",
      artist: "Kendrick Lamar",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/kendrick.jpg",
      audioPath: "/assets/music/Kendrick Lamar - PRIDE..mp3"
    },
    {
      id: 13,
      title: "Ms. Jackson",
      artist: "Outkast",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/ms.jackson.jpg",
      audioPath: "/assets/music/OutKast - Mr Jackson.mp3"
    },
    {
      id: 14,
      title: "Heavy Dirty Soul",
      artist: "Twenty one pilots",
      genre: "Rock",
      coverPath: "/assets/covers/Blurryface.jpeg",
      audioPath: "/assets/music/Twenty one pilots - Heavy Dirty Soul.mp3"
    },
    {
      id: 15,
      title: "Reflections",
      artist: "The Neighbourhood",
      genre: "Indie",
      coverPath: "/assets/covers/reflections.jpg",
      audioPath: "/assets/music/The Neighbourhood - Reflections.mp3"
    },
    {
      id: 16,
      title: "Father stretch my hands",
      artist: "Kanye West",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/kanye_father.jpg",
      audioPath: "/assets/music/Kanye West - Father Stretch My Hands (ft. Kid Cudi).mp3"
    },
    {
      id: 17,
      title: "Slow dancing in the dark",
      artist: "Joji",
      genre: "R&B",
      coverPath: "/assets/covers/joji.jpg",
      audioPath: "/assets/music/Joji - Slow dancing in the dark.mp3"
    },
    {
      id: 20,
      title: "One Dance",
      artist: "Drake",
      genre: "Pop",
      coverPath: "/assets/covers/drake_one.jpg",
      audioPath: "/assets/music/Drake feat. Wizkid & Kyla - One Dance.mp3"
    }
    ,
    {
      id: 21,
      title: "Nuts",
      artist: "Lil Peep",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/lilPeep.jpg",
      audioPath: "/assets/music/Lil Peep - Nuts (feat. rainy bear).mp3"
    },
    {
      id: 22,
      title: "  ",
      artist: "A$AP Rocky",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/asap.jpg",
      audioPath: "/assets/music/Asap Rocky - Sundress.mp3"
    },
    {
      id: 23,
      title: "Sunflower",
      artist: "Post Malone",
      genre: "Pop",
      coverPath: "/assets/covers/sunflower.jpg",
      audioPath: "/assets/music/Post Malone feat. Swae Lee - Sunflower.mp3"
    },
    {
      id: 24,
      title: "Ginseng streep 2002",
      artist: "Yung Lean",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/ginseng.jpg",
      audioPath: "/assets/music/Yung Lean - Ginseng Strip.mp3"
    },
    {
      id: 25,
      title: "American Boy",
      artist: "Estelle",
      genre: "R&B",
      coverPath: "/assets/covers/americanboy.jpg",
      audioPath: "/assets/music/Estelle - American Boy (feat. Kanye West).mp3"
    },
    {
      id: 26,
      title: "Something about you",
      artist: "Eyedress",
      genre: "Indie",
      coverPath: "/assets/covers/something about you.jpg",
      audioPath: "/assets/music/Eyedress - Something About You (feat. Dent May).mp3"
    },
    {
      id: 27,
      title: "Танцы",
      artist: "Ssshhhiiittt!",
      genre: "Rock",
      coverPath: "/assets/covers/танцы.jpg",
      audioPath: "/assets/music/ssshhhiiittt! - Танцы.mp3"
    },
    {
      id: 28,
      title: "Love me",
      artist: "Lil Wayne",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/loveme.jpg",
      audioPath: "/assets/music/Lil Wayne - Love Me (feat. Drake, Future).mp3"
    },
    {
      id: 29,
      title: "Fuck Love",
      artist: "XXXTentacion",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/fucklove.jpg",
      audioPath: "/assets/music/Xxxtentacion, Trippie Redd - Fuck Love.mp3"
    },
    {
      id: 30,
      title: "Ivy",
      artist: "Frank Ocean",
      genre: "R&B",
      coverPath: "/assets/covers/ivy.png",
      audioPath: "/assets/music/Frank Ocean - Ivy.mp3"
    },
    {
      id: 31,
      title: "Pink + White",
      artist: "Frank Ocean",
      genre: "R&B",
      coverPath: "/assets/covers/ivy.png",
      audioPath: "/assets/music/Frank Ocean - Pink & White.mp3"
    },
    {
      id: 32,
      title: "Kill Bill",
      artist: "SZA",
      genre: "R&B",
      coverPath: "/assets/covers/killbill.jpg",
      audioPath: "/assets/music/SZA - Kill Bill.mp3"
    },
    {
      id: 33,
      title: "For The First Time",
      artist: "Mac Demarco",
      genre: "Indie",
      coverPath: "/assets/covers/macdemarco.jpg",
      audioPath: "/assets/music/Mac Demarco - For The First Time (Indie Rock 2017) (1).mp3"
    },
    {
      id: 34,
      title: "Chamber of Reflection",
      artist: "Mac Demarco",
      genre: "Pop",
      coverPath: "/assets/covers/macdemarco1.jpg",
      audioPath: "/assets/music/Mac Demarco - Chamber of Reflection.mp3"
    },
    {
      id: 35,
      title: "My Kind of Woman",
      artist: "Mac Demarco",
      genre: "Indie",
      coverPath: "/assets/covers/macdemarco2.jpg",
      audioPath: "/assets/music/Mac Demarco - My Kind of Woman.mp3"
    },
    {
      id: 36,
      title: "One More Love Song",
      artist: "Mac Demarco",
      genre: "Indie",
      coverPath: "/assets/covers/macdemarco.jpg",
      audioPath: "/assets/music/Mac Demarco - One More Love Song.mp3"
    },
    {
      id: 37,
      title: "Dark Red",
      artist: "Steve Lacy",
      genre: "R&B",
      coverPath: "/assets/covers/stevelacy.jpg",
      audioPath: "/assets/music/Steve Lacy - Dark Red.mp3"
    },
    {
      id: 38,
      title: "Bad Habit",
      artist: "Steve Lacy",
      genre: "R&B",
      coverPath: "/assets/covers/stevelacy1.jpg",
      audioPath: "/assets/music/Steve Lacy - Bad Habit.mp3"
    },
    {
      id: 39,
      title: "Sweater Weather",
      artist: "The Neighbourhood",
      genre: "Rock",
      coverPath: "/assets/covers/theneighbourhood.jpg",
      audioPath: "/assets/music/The Neighbourhood - Sweater Weather.mp3"
    },
    {
      id: 40,
      title: "Daddy Issues",
      artist: "The Neighbourhood",
      genre: "Rock",
      coverPath: "/assets/covers/pic1.jpg",
      audioPath: "/assets/music/The Neighbourhood - Daddy Issues.mp3"
    },
    {
      id: 41,
      title: "YKWIM",
      artist: "Yot Club",
      genre: "Indie",
      coverPath: "/assets/covers/ykwim.jpg",
      audioPath: "/assets/music/Yot Club - YKWIM.mp3"
    },
    {
      id: 42,
      title: "Empire State Of Mind",
      artist: "JAY-Z, Alicia Keys",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/jayz.jpg",
      audioPath: "/assets/music/JAY-Z, Alicia Keys - Empire State Of Mind.mp3"
    },
    {
      id: 43,
      title: "Money",
      artist: "The Drums",
      genre: "Indie",
      coverPath: "/assets/covers/drums.jpg",
      audioPath: "/assets/music/The Drums - Money.mp3"
    },
    {
      id: 44,
      title: "Jealous",
      artist: "Eyedress",
      genre: "Pop",
      coverPath: "/assets/covers/eyedress.jpg",
      audioPath: "/assets/music/Eyedress - Jealous.mp3"
    },
    {
      id: 45,
      title: "She",
      artist: "Tyler, The Creator (Feat. Frank Ocean)",
      genre: "Hip-Hop",
      coverPath: "/assets/covers/tyler.jpg",
      audioPath: "/assets/music/Tyler, The Creator - She (Feat. Frank Ocean).mp3"
    },
    {
      id: 46,
      title: "Cigarettes out the Window",
      artist: "TV Girl",
      genre: "Indie",
      coverPath: "/assets/covers/tvgirl.jpg",
      audioPath: "/assets/music/TV Girl - Cigarettes out the Window.mp3"
    }
  ];
  
  export default tracks;
  
  // Получаем уникальные жанры
  export const genres = [...new Set(tracks.map(track => track.genre))];