const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
        'Referer': 'https://unsplash.com/'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // redirect
        file.close(); fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (e) => { try{file.close(); if(fs.existsSync(dest)) fs.unlinkSync(dest);}catch{}; reject(e); });
    req.setTimeout(20000, () => { req.destroy(new Error('timeout')); });
  });
}

async function main() {
  const tasks = [
    // services 13
    ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-01.jpg'],
    ['https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-02.jpg'],
    ['https://images.unsplash.com/photo-1519345182560-3f2917c47231?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-03.jpg'],
    ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-04.jpg'],
    ['https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-05.jpg'],
    ['https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-06.jpg'],
    ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-07.jpg'],
    ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-08.jpg'],
    ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-09.jpg'],
    ['https://images.unsplash.com/photo-1570172619644-dfd03edfa798?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-10.jpg'],
    ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-11.jpg'],
    ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-12.jpg'],
    ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80&auto=format&fit=crop', 'public/images/services/service-13.jpg'],
    // masters 4
    ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80&auto=format&fit=crop', 'public/images/masters/master-01.jpg'],
    ['https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop', 'public/images/masters/master-02.jpg'],
    ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80&auto=format&fit=crop', 'public/images/masters/master-03.jpg'],
    ['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop', 'public/images/masters/master-04.jpg'],
    // interior for home if missing
    ['https://images.unsplash.com/photo-1631886166028-1e72c2acb58a?w=1200&q=80&auto=format&fit=crop', 'public/images/home/interior.jpg'],
  ];

  for (const [url, rel] of tasks) {
    const dest = path.join(__dirname, '..', rel);
    try {
      console.log(`Downloading ${rel} ...`);
      await download(url, dest);
      const sz = fs.statSync(dest).size;
      console.log(`OK ${rel} ${(sz/1024).toFixed(1)}KB`);
    } catch (e) {
      console.error(`FAIL ${rel}: ${e.message}`);
      // fallback to placeholder via picsum if unsplash fails
      try {
        const fallback = `https://picsum.photos/seed/${path.basename(rel).split('.')[0]}/800/600`;
        console.log(`  trying fallback ${fallback}`);
        await download(fallback, dest);
        console.log(`  OK fallback ${rel}`);
      } catch (e2) {
        console.error(`  FAIL fallback ${rel}: ${e2.message}`);
      }
    }
  }
  console.log('Done');
}

main();
