const CATEGORIES_TYPES = [
  {
    id: 0,
    name: "Angajați ai PMT",
    options: [
      {
        id: 1,
        name: "Angajat incompetent",
      },
      {
        id: 2,
        name: "Angajat nepoliticos",
      },
      {
        id: 3,
        name: "Solicitare de mită/beneficii materiale",
      },
    ],
  },

  {
    id: 4,
    name: "Aplicatia mobila de sesizari",
    options: [
      {
        id: 5,
        name: "Problema cu functionarea aplicatiei mobile",
      },
      {
        id: 6,
        name: "Sugestie de imbunatatire a aplicatiei mobile",
      },
    ],
  },

  {
    id: 7,
    name: "Apă și canalizare",
    options: [
      {
        id: 8,
        name: "Capac de canalizare lipsă/deteriorat",
      },
      {
        id: 9,
        name: "Fantani",
      },
      {
        id: 10,
        name: "Inundații",
      },
      {
        id: 11,
        name: "Stradă inundată"
      }],
  },

  {
    id: 12,
    name: "Constructii și terenuri",
    options: [
      {
        id: 13,
        name: "Abandon deseuri",
      },
      {
        id: 14,
        name: "Clădire/teren în paragină",
      },
      {
        id: 15,
        name: "Construcție ilegală",
      },
      {
        id: 16,
        name: "Construcție periculoasă",
      },
      {
        id: 17,
        name: "Teren ocupat ilegal"
      }]
  },
  {
    id: 18,
    name: "Garaje cimitire coserit spatii utilitare",
    options: [
      {
        id: 19,
        name: "Cimitire",
      },
      {
        id: 20,
        name: "Coserit",
      },
      {
        id: 21,
        name: "Garaje",
      },
      {
        id: 22,
        name: "Spatii utilitare"
      }],
  },
  {
    id: 23,
    name: "Gradina Zoologica",
    options: [
      {
        id: 24,
        name: "Sugestii/reclamatii gradina zoologica"
      }
    ],
  },
  {
    id: 25,
    name: "Gunoi",
    options: [
      {
        id: 26,
        name: "Cosuri gunoi lipsa / deteriorate / distruse",
      },
      {
        id: 27,
        name: "Deseuri menajere",
      },
      {
        id: 28,
        name: "Deseuri voluminoase abandonate pe domeniul public",
      },
      {
        id: 29,
        name: "Deșeuri vegetaledin constructii abandonate pe domeniul public"
      }
    ],
  },

  {
    id: 30,
    name: "Iluminat public",
    options: [
      {
        id: 31,
        name: "Aparat de iluminat nefunctional",
      },
      {
        id: 32,
        name: "Aparat de iluminat rasucit",
      },
      {
        id: 33,
        name: "Consola desprinsa",
      },
      {
        id: 34,
        name: "Consola rasucita",
      },
      {
        id: 35,
        name: "Cutie baza stalp avariata",
      },
      {
        id: 36,
        name: "Cutie baza stalp deschisa",
      },
      {
        id: 37,
        name: "Nu exista stalpi iluminat public",
      },
      {
        id: 38,
        name: "Nu functioneaza curentul in zona",
      },
      {
        id: 39,
        name: "Stalp cazut",
      },
      {
        id: 40,
        name: "Stalp fisurat"
      }
    ],
  },

  {
    id: 41,
    name: "Liberul acces la informatiile de interes public",
    options: [
      {
        id: 42,
        name: "Legea 544/2001"
      }
    ],
  },

  {
    id: 43,
    name: "Mediu parcuri și spații verzi",
    options: [
      {
        id: 44,
        name: "Alee murdară (parc",
      },
      {
        id: 45,
        name: "Animale cu stapan (de companie",
      },
      {
        id: 46,
        name: "Animale de ferma",
      },
      {
        id: 47,
        name: "Animale fara stapan",
      },
      {
        id: 48,
        name: "Arbori taiati ilegal",
      },
      {
        id: 49,
        name: "Cadavre de animale",
      },
      {
        id: 50,
        name: "Calamități naturale / covid-19",
      },
      {
        id: 51,
        name: "Cosmetizare/defrisare arbori",
      },
      {
        id: 52,
        name: "Deratizare/Dezinsectie/Dezinfectie (Tantari sobolani",
      },
      {
        id: 53,
        name: "Exploatări ilegale a vegetatiei forestiere",
      },
      {
        id: 54,
        name: "Loc de joacă deteriorat / mobilier urban deteriorat",
      },
      {
        id: 55,
        name: "Plante alergene (Ambrozieetc",
      },
      {
        id: 56,
        name: "Poluare / disconfort olfactiv / fonic",
      },
      {
        id: 57,
        name: "Spațiu verde neîngrijit"
      }
    ],
  },

  {
    id: 58,
    name: "Ordine publică",
    options: [
      {
        id: 59,
        name: "Agent comercial ambulant/neautorizat",
      },
      {
        id: 60,
        name: "Distrugere/Furt",
      },
      {
        id: 61,
        name: "Nereguli acte de comert",
      },
      {
        id: 62,
        name: "Persoane fara adapost/cersetorie",
      },
      {
        id: 63,
        name: "Tulburarea Liniștii Publice"
      }
    ],
  },

  {
    id: 64,
    name: "Organizare şi funcţionare asociaţii de proprietari",
    options: [
      {
        id: 65,
        name: "Nerespectare obligaţii de către proprietari",
      },
      {
        id: 66,
        name: "Neîndeplinire atribuţii reprezentanţi asociaţii de proprietari",
      },
      {
        id: 67,
        name: "Utilizare părţi comune"
      }],
  },
  {
    id: 68,
    name: "Pericol iminent",
    options: [
      {
        id: 69,
        name: "Pericol iminent"
      }
    ],
  },
  {
    id: 70,
    name: "Piețe agroalimentare",
    options: [
      {
        id: 71,
        name: "Probleme din piețe",
      },
      {
        id: 72,
        name: "Sugestii de îmbunătățire a piețelor"
      }
    ],
  },

  {
    id: 73,
    name: "Site-ul PMT",
    options: [
      {
        id: 74,
        name: "Problema cu functionarea site-ului PMT",
      },
      {
        id: 75,
        name: "Sugestie de imbunatatire a site-ului PMT"
      }
    ],
  },

  {
    id: 76,
    name: "Spitale",
    options: [
      {
        id: 77,
        name: "Probleme în spitale",
      },
      {
        id: 78,
        name: "Sugestii spitale"
      }
    ],
  },

  {
    id: 79,
    name: "Străzi și trotuare",
    options: [
      {
        id: 80,
        name: "Drum înzăpezit/înghețat",
      },
      {
        id: 81,
        name: "Groapă",
      },
      {
        id: 82,
        name: "Obiecte abandonate pe domeniul public",
      },
      {
        id: 83,
        name: "Trotuar/Pistă de biciclete deteriorat/ă",
      },
    ],
  },

  {
    id: 84,
    name: "Trafic rutier și semne de circulație",
    options: [
      {
        id: 85,
        name: "Parcare abuziva/ilegala",
      },
      {
        id: 86,
        name: "Pistă de biciclete blocată",
      },
      {
        id: 87,
        name: "Semafor defect",
      },
      {
        id: 88,
        name: "Semn de circulație lipsă/deteriorat/poziționat greșit",
      },
      {
        id: 89,
        name: "Strada/intrare blocata",
      },
      {
        id: 90,
        name: "Vehicul abandonat"
      }
    ],
  },

  {
    id: 91,
    name: "Transport în comun",
    options: [
      {
        id: 92,
        name: "Autobuze",
      },
      {
        id: 93,
        name: "Biciclete VeloTM",
      },
      {
        id: 94,
        name: "Taxi",
      },
      {
        id: 95,
        name: "Tramvaie",
      },
      {
        id: 96,
        name: "Troleibuze",
      },
      {
        id: 97,
        name: "Trotinete"
      }
    ],
  },
  {
    id: 98,
    name: "Urbanism",
    options: [
      {
        id: 99,
        name: "Construcție ridicată ilegal",
      },
      {
        id: 100,
        name: "Nerespectare documentații de urbanism",
      },
      {
        id: 101,
        name: "Nerespectarea Autorizației de construire",
      },
      {
        id: 102,
        name: "Întârzieri eliberare documente Directia Urbanism",
      },
      {
        id: 103,
        name: "Șantier în lucru fără panou de șantier"
      }
    ],
  },

  {
    id: 104,
    name: "Școli",
    options: [
      {
        id: 105,
        name: "Probleme/sugestii referitoare la administrarea spațiului și dotările școlii"
      }
    ],
  }
]
module.exports = CATEGORIES_TYPES