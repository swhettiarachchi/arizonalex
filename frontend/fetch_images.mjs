import https from 'https';

const leaders = [
  'Donald Trump',
  'Hakeem Jeffries',
  'Gavin Newsom',
  'Ron DeSantis',
  'Charles III',
  'Keir Starmer',
  'Kemi Badenoch',
  'Wes Streeting',
  'Anura Kumara Dissanayake',
  'Harini Amarasuriya',
  'Sajith Premadasa',
  'Namal Rajapaksa',
  'Emmanuel Macron',
  'François Bayrou',
  'Marine Le Pen',
  'Jordan Bardella',
  'Droupadi Murmu',
  'Narendra Modi',
  'Rahul Gandhi',
  'Yogi Adityanath',
  'Akhilesh Yadav',
  'Xi Jinping',
  'Li Qiang',
  'Vladimir Putin',
  'Mikhail Mishustin',
  'Frank-Walter Steinmeier',
  'Friedrich Merz',
  'Alice Weidel',
  'Robert Habeck',
  'Naruhito',
  'Shigeru Ishiba',
  'Yoshihiko Noda',
  'Taro Kono',
  'Luiz Inácio Lula da Silva',
  'Jair Bolsonaro',
  'Tarcísio de Freitas',
  'Anthony Albanese',
  'Mark Carney',
  'Han Duck-soo',
  'Claudia Sheinbaum',
  'Sergio Mattarella',
  'Giorgia Meloni',
  'Felipe VI',
  'Pedro Sánchez',
  'Cyril Ramaphosa',
  'Recep Tayyip Erdoğan',
  'Bola Tinubu',
  'Abdel Fattah el-Sisi',
  'Javier Milei',
  'Prabowo Subianto',
  'Salman of Saudi Arabia',
  'Mohammed bin Salman',
  'Asif Ali Zardari',
  'Shehbaz Sharif',
  'Volodymyr Zelenskyy',
  'Denys Shmyhal',
  'Isaac Herzog',
  'Benjamin Netanyahu',
  'Andrzej Duda',
  'Donald Tusk',
  'Ali Khamenei',
  'Masoud Pezeshkian',
  'Bongbong Marcos',
  'Gustavo Petro',
  'William Ruto',
  'Muhammad Yunus',
  'Abiy Ahmed',
  'Anwar Ibrahim',
  'Lawrence Wong',
  'Christopher Luxon',
  'Tharman Shanmugaratnam'
];

async function getImageUrl(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original|name&titles=${encodeURIComponent(title)}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query?.pages;
          if (pages) {
            const page = Object.values(pages)[0];
            if (page.original && page.original.source) {
               // extract just the filename from source like "https://upload.wikimedia.org/wikipedia/commons/x/xx/FILE.jpg"
               let filename = page.pageimage || decodeURIComponent(page.original.source.split('/').pop());
               resolve(filename);
               return;
            }
          }
          resolve(null);
        } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

(async () => {
   const results = {};
   for (const leader of leaders) {
      const img = await getImageUrl(leader);
      if (img) {
         results[leader] = img;
      }
      // Small delay to be nice to API
      await new Promise(r => setTimeout(r, 100));
   }
   console.log(JSON.stringify(results, null, 2));
})();
