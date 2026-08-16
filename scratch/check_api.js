import http from 'http';
http.get('http://localhost:5173/api/public/projects/contributor', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const projects = JSON.parse(data).projects;
    console.log(projects.map(p => ({ title: p.title, terms: p.termsAndConditions })));
  });
});
