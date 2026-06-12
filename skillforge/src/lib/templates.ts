export function generateTemplate(
  templateId: 'minimal' | 'modern' | 'developer' | 'creative', 
  data: any, 
  theme: { darkMode: boolean, primaryColor: string }
): string {
  const isDark = theme.darkMode;
  const bg = isDark ? '#0F172A' : '#ffffff';
  const text = isDark ? '#f8fafc' : '#0f172a';
  const muted = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#1e293b' : '#f1f5f9';
  const primary = theme.primaryColor;

  const { personalInfo, experience, education, skills, projects } = data;
  
  const photoHtml = personalInfo.profilePhoto ? 
    `<img src="${personalInfo.profilePhoto}" alt="${personalInfo.firstName}" class="profile-photo" />` : '';

  const styleBase = `
    body {
      font-family: 'Inter', sans-serif;
      background-color: ${bg};
      color: ${text};
      line-height: 1.6;
      margin: 0;
      padding: 0;
      transition: all 0.3s ease;
    }
    h1, h2, h3, h4 { margin-top: 0; }
    a { color: ${primary}; text-decoration: none; }
    .badge { 
      background-color: ${primary}20; 
      color: ${primary}; 
      padding: 0.25rem 0.75rem; 
      border-radius: 9999px; 
      font-size: 0.875rem; 
      display: inline-block; 
      margin: 0.25rem 0.25rem 0.25rem 0;
    }
  `;

  // --- MINIMAL TEMPLATE ---
  const minimalStyle = `
    ${styleBase}
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .section { margin-bottom: 4rem; }
    .card { background-color: ${cardBg}; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .hero { padding: 4rem 0; text-align: left; border-bottom: 1px solid ${cardBg}; display: flex; align-items: center; gap: 2rem; }
    .profile-photo { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; }
    h1 { font-size: 3rem; font-weight: 800; letter-spacing: -0.05em; margin-bottom: 0.5rem; }
    .headline { font-size: 1.5rem; color: ${muted}; font-weight: 400; }
    .nav { margin-top: 2rem; display: flex; gap: 1rem; }
    .nav a { font-weight: 600; }
  `;

  // --- MODERN TEMPLATE ---
  const modernStyle = `
    ${styleBase}
    .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
    .section { margin-bottom: 4rem; }
    .card { background-color: ${cardBg}; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 1px solid ${primary}40; box-shadow: 0 10px 30px -10px ${primary}20; transition: transform 0.2s; }
    .card:hover { transform: translateY(-5px); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
    .hero { padding: 6rem 0; text-align: center; }
    .profile-photo { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 4px solid ${primary}; margin: 0 auto 1.5rem auto; display: block; box-shadow: 0 10px 25px -5px ${primary}40; }
    h1 { font-size: 4rem; font-weight: 900; background: linear-gradient(135deg, ${primary}, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .headline { font-size: 1.25rem; color: ${muted}; }
    .nav { justify-content: center; margin-top: 2rem; display: flex; gap: 1rem; }
  `;

  // --- DEVELOPER TEMPLATE (TWO-COLUMN) ---
  const developerStyle = `
    ${styleBase}
    body { display: flex; min-height: 100vh; flex-direction: column; }
    @media (min-width: 1024px) { body { flex-direction: row; } }
    .sidebar { background-color: ${cardBg}; padding: 3rem; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; }
    @media (min-width: 1024px) { .sidebar { width: 350px; position: fixed; top: 0; bottom: 0; left: 0; } }
    .content { padding: 3rem; flex: 1; }
    @media (min-width: 1024px) { .content { margin-left: 350px; padding: 4rem 6rem; } }
    .profile-photo { width: 160px; height: 160px; border-radius: 1rem; object-fit: cover; margin-bottom: 2rem; box-shadow: 12px 12px 0px ${primary}; }
    h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 0.5rem; }
    .headline { font-size: 1.25rem; color: ${primary}; font-weight: 600; margin-bottom: 1.5rem; }
    .nav { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; width: 100%; }
    .nav a { display: block; padding: 0.75rem 1rem; background-color: ${bg}; border-radius: 8px; font-weight: 500; transition: all 0.2s; border-left: 4px solid transparent; }
    .nav a:hover { border-left-color: ${primary}; transform: translateX(5px); }
    .section { margin-bottom: 4rem; }
    .section h2 { border-bottom: 2px solid ${cardBg}; padding-bottom: 0.75rem; margin-bottom: 1.5rem; font-size: 1.75rem; }
    .card { margin-bottom: 2.5rem; }
    .card-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem; flex-wrap: wrap; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } }
    .proj-card { background-color: ${cardBg}; padding: 1.5rem; border-radius: 8px; border-top: 4px solid ${primary}; }
  `;

  // --- CREATIVE TEMPLATE ---
  const creativeStyle = `
    ${styleBase}
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .hero { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; position: relative; }
    .profile-photo { position: absolute; right: 5%; top: 50%; transform: translateY(-50%); width: 400px; height: 400px; object-fit: cover; border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; z-index: -1; opacity: 0.8; filter: grayscale(50%) contrast(1.2); box-shadow: 20px 20px 0 ${primary}40; animation: morph 8s ease-in-out infinite; }
    @keyframes morph { 0% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; } 50% { border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%; } 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; } }
    h1 { font-size: 6rem; font-weight: 900; line-height: 1; text-transform: uppercase; letter-spacing: -0.02em; margin-bottom: 1rem; max-width: 800px; }
    .headline { font-size: 2rem; font-weight: 300; background-color: ${primary}; color: #fff; display: inline-block; padding: 0.5rem 1.5rem; border-radius: 999px; }
    .nav { display: flex; gap: 2rem; margin-top: 3rem; font-size: 1.25rem; font-weight: bold; }
    .nav a { position: relative; }
    .nav a::after { content: ''; position: absolute; width: 100%; height: 3px; bottom: -5px; left: 0; background-color: ${primary}; transform: scaleX(0); transform-origin: bottom right; transition: transform 0.3s ease-out; }
    .nav a:hover::after { transform: scaleX(1); transform-origin: bottom left; }
    .section { margin: 8rem 0; }
    .section h2 { font-size: 3rem; font-weight: 900; margin-bottom: 3rem; position: relative; display: inline-block; }
    .section h2::before { content: ''; position: absolute; width: 50px; height: 50px; background-color: ${primary}40; border-radius: 50%; left: -20px; top: -10px; z-index: -1; }
    .card { padding: 2rem; background: ${cardBg}; border-radius: 0; border-left: 5px solid ${primary}; margin-bottom: 2rem; transition: background 0.3s; }
    .card:hover { background: ${primary}10; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
    @media (max-width: 900px) { h1 { font-size: 4rem; } .profile-photo { width: 250px; height: 250px; position: static; transform: none; margin-bottom: 2rem; } }
  `;

  let css = minimalStyle;
  if (templateId === 'modern') css = modernStyle;
  if (templateId === 'developer') css = developerStyle;
  if (templateId === 'creative') css = creativeStyle;

  // Render logic for different sections
  const renderHero = () => {
    if (templateId === 'developer') {
      return `
        <div class="sidebar">
          ${photoHtml}
          <h1>${personalInfo.firstName} ${personalInfo.lastName}</h1>
          <div class="headline">${personalInfo.headline || 'Software Developer'}</div>
          <p>${personalInfo.bio}</p>
          <div class="nav">
            ${personalInfo.email ? `<a href="mailto:${personalInfo.email}">📧 Email Me</a>` : ''}
            ${personalInfo.github ? `<a href="${personalInfo.github}">💻 GitHub</a>` : ''}
            ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}">🔗 LinkedIn</a>` : ''}
            ${personalInfo.portfolio ? `<a href="${personalInfo.portfolio}">🌐 Portfolio</a>` : ''}
          </div>
        </div>
      `;
    }
    
    return `
      <header class="hero section">
        ${templateId === 'minimal' ? `<div>${photoHtml}</div><div>` : ''}
        ${templateId !== 'minimal' ? photoHtml : ''}
        
        <h1>${personalInfo.firstName} ${personalInfo.lastName}</h1>
        <div class="headline">${personalInfo.headline || 'Software Developer'}</div>
        <p style="margin-top: 1.5rem; max-width: 600px; ${templateId==='modern' ? 'margin-left: auto; margin-right: auto;' : ''}">${personalInfo.bio}</p>
        <div class="nav">
          ${personalInfo.email ? `<a href="mailto:${personalInfo.email}">Email</a>` : ''}
          ${personalInfo.github ? `<a href="${personalInfo.github}">GitHub</a>` : ''}
          ${personalInfo.linkedin ? `<a href="${personalInfo.linkedin}">LinkedIn</a>` : ''}
          ${personalInfo.portfolio ? `<a href="${personalInfo.portfolio}">Portfolio</a>` : ''}
        </div>
        
        ${templateId === 'minimal' ? `</div>` : ''}
      </header>
    `;
  };

  const renderExperience = () => {
    if (!experience?.length) return '';
    return `
      <section class="section">
        <h2>Experience</h2>
        <div>
          ${experience.map((exp: any) => `
            <div class="card">
              <div class="card-header" style="${templateId !== 'developer' ? 'display: flex; justify-content: space-between; align-items: baseline;' : ''}">
                <h3 style="margin-bottom: 0;">${exp.position} <span style="color: ${primary};">@ ${exp.company}</span></h3>
                <span style="color: ${muted}; font-size: 0.875rem; font-weight: 500;">${exp.startDate} - ${exp.endDate}</span>
              </div>
              <p style="margin-top: 0.5rem;">${exp.description}</p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderProjects = () => {
    if (!projects?.length) return '';
    return `
      <section class="section">
        <h2>Featured Projects</h2>
        <div class="grid">
          ${projects.map((proj: any) => `
            <div class="${templateId === 'developer' ? 'proj-card' : 'card'}">
              <h3 style="margin-bottom: 0.5rem;">${proj.name}</h3>
              <p style="color: ${muted}; font-size: 0.875rem; margin-top: 0;">${proj.description || ''}</p>
              <div style="margin-top: 1rem;">
                ${(proj.topics || proj.technologies || []).map((t: string) => `<span class="badge">${t}</span>`).join('')}
              </div>
              ${proj.html_url || proj.link ? `<a href="${proj.html_url || proj.link}" style="display: inline-block; margin-top: 1.5rem; font-weight: 600;">View Project →</a>` : ''}
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  const renderSkills = () => {
    if (!skills?.length) return '';
    return `
      <section class="section">
        <h2>Skills</h2>
        <div>
          ${skills.map((skill: string) => `<span class="badge">${skill}</span>`).join('')}
        </div>
      </section>
    `;
  };

  const renderEducation = () => {
    if (!education?.length) return '';
    return `
      <section class="section">
        <h2>Education</h2>
        <div>
          ${education.map((edu: any) => `
            <div class="card">
              <div class="card-header" style="${templateId !== 'developer' ? 'display: flex; justify-content: space-between; align-items: baseline;' : ''}">
                <h3 style="margin-bottom: 0;">${edu.degree}</h3>
                <span style="color: ${muted}; font-size: 0.875rem; font-weight: 500;">${edu.graduationYear}</span>
              </div>
              <p style="margin-top: 0.5rem;">${edu.institution} ${edu.cgpa ? `• <strong style="color: ${primary}">CGPA: ${edu.cgpa}</strong>` : ''}</p>
            </div>
          `).join('')}
        </div>
      </section>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo.firstName} ${personalInfo.lastName} | Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;800;900&display=swap" rel="stylesheet">
  <style>${css}</style>
</head>
<body>
  ${templateId === 'developer' ? renderHero() : ''}
  
  <div class="${templateId === 'developer' ? 'content' : 'container'}">
    ${templateId !== 'developer' ? renderHero() : ''}
    ${renderExperience()}
    ${renderProjects()}
    ${renderSkills()}
    ${renderEducation()}
  </div>
</body>
</html>
  `;
}
