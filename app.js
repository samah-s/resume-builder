pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

let educationCount = 0;
let experienceCount = 0;
let projectCount = 0;
let uploadedFile = null;
let parsedResumeText = '';

async function extractStructuredDataWithGemini(resumeText) {
  const res = await fetch("http://localhost:3001/parse-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText })
  });

  if (!res.ok) {
    throw new Error("Gemini backend failed");
  }

  return await res.json();
}

async function processUploadedResume() {
  if (!parsedResumeText) return;

  uploadStatus.innerHTML =
    '<div class="status-message info">Gemini is structuring your resume...</div>';

  try {
    const data = await extractStructuredDataWithGemini(parsedResumeText);

    // Basic info
    fullName.value = data.name || "";
    email.value = data.email || "";
    phone.value = data.phone || "";
    linkedin.value = data.linkedin || "";
    github.value = data.github || "";

    // Skills
    languages.value = data.skills.languages.join(", ");
    frameworks.value = data.skills.frameworks.join(", ");
    tools.value = data.skills.tools.join(", ");
    libraries.value = data.skills.libraries.join(", ");

    // Education
    educationContainer.innerHTML = "";
    educationCount = 0;
    data.education.forEach(e => {
      addEducation();
      const i = educationCount - 1;
      document.querySelector(`[name="edu-institution-${i}"]`).value = e.institution;
      document.querySelector(`[name="edu-degree-${i}"]`).value = e.degree;
      document.querySelector(`[name="edu-duration-${i}"]`).value = e.duration;
      document.querySelector(`[name="edu-gpa-${i}"]`).value = e.gpa;
    });

    // Experience
    experienceContainer.innerHTML = "";
    experienceCount = 0;
    data.experience.forEach(e => {
      addExperience();
      const i = experienceCount - 1;
      document.querySelector(`[name="exp-company-${i}"]`).value = e.company;
      document.querySelector(`[name="exp-position-${i}"]`).value = e.position;
      document.querySelector(`[name="exp-duration-${i}"]`).value = e.duration;
      document.querySelector(`[name="exp-location-${i}"]`).value = e.location;
      document.querySelector(`[name="exp-desc-${i}"]`).value =
        e.bullets.join("\n");
    });

    // Projects
    projectsContainer.innerHTML = "";
    projectCount = 0;
    data.projects.forEach(p => {
      addProject();
      const i = projectCount - 1;
      document.querySelector(`[name="proj-name-${i}"]`).value = p.name;
      document.querySelector(`[name="proj-tech-${i}"]`).value = p.tech;
      document.querySelector(`[name="proj-desc-${i}"]`).value =
        p.bullets.join("\n");
      document.querySelector(`[name="proj-link-${i}"]`).value = p.link;
    });

    switchTab("manual");
    uploadStatus.innerHTML =
      '<div class="status-message success">✓ Resume auto-filled using Gemini</div>';

  } catch (err) {
    console.error(err);
    uploadStatus.innerHTML =
      '<div class="status-message error">Gemini failed to parse resume</div>';
  }
}


function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    if (tab === 'manual') {
        document.querySelector('.tab:first-child').classList.add('active');
        document.getElementById('manual-tab').classList.add('active');
    } else {
        document.querySelector('.tab:last-child').classList.add('active');
        document.getElementById('upload-tab').classList.add('active');
    }
}

// Drag and drop
const uploadArea = document.getElementById('uploadArea');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.add('dragover');
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadArea.addEventListener(eventName, () => {
        uploadArea.classList.remove('dragover');
    }, false);
});

uploadArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        document.getElementById('fileInput').files = files;
        handleFileUpload({ target: { files: files } });
    }
}

function addEducation() {
    const container = document.getElementById('educationContainer');
    const id = educationCount++;
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.id = `education-${id}`;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeElement('education-${id}')">Remove</button>
        <div class="form-group">
            <label>Institution</label>
            <input type="text" name="edu-institution-${id}">
        </div>
        <div class="grid-2">
            <div class="form-group">
                <label>Degree</label>
                <input type="text" name="edu-degree-${id}" placeholder="e.g., B.S. in Computer Science">
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" name="edu-duration-${id}" placeholder="e.g., Aug 2018 - May 2022">
            </div>
        </div>
        <div class="form-group">
            <label>GPA / Achievements</label>
            <input type="text" name="edu-gpa-${id}" placeholder="e.g., GPA: 3.8/4.0">
        </div>
    `;
    container.appendChild(div);
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const id = experienceCount++;
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.id = `experience-${id}`;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeElement('experience-${id}')">Remove</button>
        <div class="grid-2">
            <div class="form-group">
                <label>Company</label>
                <input type="text" name="exp-company-${id}">
            </div>
            <div class="form-group">
                <label>Position</label>
                <input type="text" name="exp-position-${id}">
            </div>
        </div>
        <div class="grid-2">
            <div class="form-group">
                <label>Duration</label>
                <input type="text" name="exp-duration-${id}" placeholder="e.g., June 2022 - Present">
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" name="exp-location-${id}">
            </div>
        </div>
        <div class="form-group">
            <label>Responsibilities & Achievements (one per line)</label>
            <textarea name="exp-desc-${id}" placeholder="• Developed and maintained web applications\n• Improved system performance by 40%"></textarea>
        </div>
    `;
    container.appendChild(div);
}

function addProject() {
    const container = document.getElementById('projectsContainer');
    const id = projectCount++;
    const div = document.createElement('div');
    div.className = 'dynamic-section';
    div.id = `project-${id}`;
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeElement('project-${id}')">Remove</button>
        <div class="grid-2">
            <div class="form-group">
                <label>Project Name</label>
                <input type="text" name="proj-name-${id}">
            </div>
            <div class="form-group">
                <label>Technologies</label>
                <input type="text" name="proj-tech-${id}" placeholder="e.g., React, Node.js, MongoDB">
            </div>
        </div>
        <div class="form-group">
            <label>Description & Key Features (one per line)</label>
            <textarea name="proj-desc-${id}" placeholder="• Built a full-stack web application\n• Implemented user authentication"></textarea>
        </div>
        <div class="form-group">
            <label>Link (optional)</label>
            <input type="url" name="proj-link-${id}">
        </div>
    `;
    container.appendChild(div);
}

function removeElement(id) {
    document.getElementById(id).remove();
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFile = file;
    const fileNameDiv = document.getElementById('fileName');
    const statusDiv = document.getElementById('uploadStatus');
    
    fileNameDiv.textContent = `Selected: ${file.name}`;
    statusDiv.innerHTML = '<div class="status-message info">Reading file... <span class="loading"></span></div>';
    
    try {
        let text = '';
        const fileType = file.name.split('.').pop().toLowerCase();
        
        if (fileType === 'pdf') {
            text = await extractTextFromPDF(file);
        } else if (fileType === 'docx') {
            text = await extractTextFromDOCX(file);
        } else if (fileType === 'txt') {
            text = await extractTextFromTXT(file);
        } else {
            throw new Error('Unsupported file format');
        }

        parsedResumeText = text;
        statusDiv.innerHTML = '<div class="status-message success">✓ Resume parsed successfully! Click "Process & Generate LaTeX" to continue.</div>';
        document.getElementById('processBtn').disabled = false;
        
    } catch (error) {
        statusDiv.innerHTML = `<div class="status-message error">✗ Error reading file: ${error.message}</div>`;
        document.getElementById('processBtn').disabled = true;
    }
}

async function extractTextFromPDF(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }
    
    return fullText;
}

async function extractTextFromDOCX(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

async function extractTextFromTXT(file) {
    return await file.text();
}

async function parseResumeWithAI(text) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.innerHTML = '<div class="status-message info">🤖 AI is analyzing your resume... <span class="loading"></span></div>';
    
    try {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 4000,
                messages: [{
                    role: "user",
                    content: `You are an expert resume parser for IT/Software Engineering positions. Extract structured data from this resume text and return ONLY a valid JSON object with NO additional text, explanation, or markdown formatting.

Resume Text:
${text}

Return a JSON object with this EXACT structure (all fields are strings, arrays contain objects):
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number",
  "linkedin": "https://linkedin.com/in/username",
  "github": "https://github.com/username",
  "website": "personal website URL",
  "languages": "Python, Java, JavaScript",
  "frameworks": "React, Django, Spring Boot",
  "tools": "Git, Docker, AWS, Jenkins",
  "libraries": "pandas, NumPy, TensorFlow",
  "education": [
    {
      "institution": "University Name",
      "degree": "B.S. in Computer Science",
      "duration": "Aug 2018 - May 2022",
      "gpa": "GPA: 3.8/4.0 or relevant coursework/honors"
    }
  ],
  "experience": [
    {
      "company": "Company Name",
      "position": "Software Engineer",
      "duration": "June 2022 - Present",
      "location": "City, State",
      "description": "Built scalable microservices\\nImproved system performance by 40%\\nMentored junior developers"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "React, Node.js, MongoDB",
      "description": "Developed full-stack web application\\nImplemented real-time features\\nDeployed on AWS",
      "link": "https://github.com/user/project"
    }
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown code blocks, no explanations, no preamble. Just the raw JSON.`
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const result = await response.json();
        const aiResponse = result.content[0].text.trim();
        
        // Remove any markdown formatting if present
        let jsonText = aiResponse;
        if (jsonText.includes('```')) {
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }
        
        const parsedData = JSON.parse(jsonText);
        return parsedData;
        
    } catch (error) {
        console.error('AI Parsing Error:', error);
        statusDiv.innerHTML = '<div class="status-message error">✗ AI parsing failed. Using basic extraction. Error: ' + error.message + '</div>';
        return basicParseResume(text);
    }
}

function basicParseResume(text) {
    const data = {
        name: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        website: '',
        languages: '',
        frameworks: '',
        tools: '',
        libraries: '',
        education: [],
        experience: [],
        projects: []
    };

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) data.email = emailMatch[0];

    const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) data.phone = phoneMatch[0];

    const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
    if (linkedinMatch) data.linkedin = 'https://' + linkedinMatch[0];

    const githubMatch = text.match(/github\.com\/[\w-]+/i);
    if (githubMatch) data.github = 'https://' + githubMatch[0];

    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length > 0 && !lines[0].includes('@') && !lines[0].match(/\d{3}/)) {
        data.name = lines[0];
    }

    const skillKeywords = [
        'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'go', 'rust', 'swift',
        'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
        'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'gitlab', 'circleci',
        'git', 'jira', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
        'tensorflow', 'pytorch', 'pandas', 'numpy', 'scikit-learn', 'junit', 'jest', 'pytest'
    ];
    
    const foundSkills = new Set();
    const textLower = text.toLowerCase();
    
    skillKeywords.forEach(skill => {
        if (textLower.includes(skill)) {
            foundSkills.add(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
    });

    const skillsArray = Array.from(foundSkills);
    if (skillsArray.length > 0) {
        data.languages = skillsArray.slice(0, 6).join(', ');
        data.frameworks = skillsArray.slice(6, 12).join(', ');
        data.tools = skillsArray.slice(12, 18).join(', ');
        data.libraries = skillsArray.slice(18).join(', ');
    }

    return data;
}


document.getElementById('resumeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    generateLatexResume();
});

function generateLatexResume() {
    const data = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        linkedin: document.getElementById('linkedin').value,
        github: document.getElementById('github').value,
        website: document.getElementById('website').value,
        languages: document.getElementById('languages').value,
        frameworks: document.getElementById('frameworks').value,
        tools: document.getElementById('tools').value,
        libraries: document.getElementById('libraries').value,
        education: [],
        experience: [],
        projects: []
    };

    for (let i = 0; i < educationCount; i++) {
        const section = document.getElementById(`education-${i}`);
        if (section) {
            const edu = {
                institution: section.querySelector(`[name="edu-institution-${i}"]`).value,
                degree: section.querySelector(`[name="edu-degree-${i}"]`).value,
                duration: section.querySelector(`[name="edu-duration-${i}"]`).value,
                gpa: section.querySelector(`[name="edu-gpa-${i}"]`).value
            };
            if (edu.institution) data.education.push(edu);
        }
    }

    for (let i = 0; i < experienceCount; i++) {
        const section = document.getElementById(`experience-${i}`);
        if (section) {
            const exp = {
                company: section.querySelector(`[name="exp-company-${i}"]`).value,
                position: section.querySelector(`[name="exp-position-${i}"]`).value,
                duration: section.querySelector(`[name="exp-duration-${i}"]`).value,
                location: section.querySelector(`[name="exp-location-${i}"]`).value,
                description: section.querySelector(`[name="exp-desc-${i}"]`).value
            };
            if (exp.company) data.experience.push(exp);
        }
    }

    for (let i = 0; i < projectCount; i++) {
        const section = document.getElementById(`project-${i}`);
        if (section) {
            const proj = {
                name: section.querySelector(`[name="proj-name-${i}"]`).value,
                tech: section.querySelector(`[name="proj-tech-${i}"]`).value,
                description: section.querySelector(`[name="proj-desc-${i}"]`).value,
                link: section.querySelector(`[name="proj-link-${i}"]`).value
            };
            if (proj.name) data.projects.push(proj);
        }
    }

    // const latex = createJakesResume(data);
    
    openInOverleaf(data);
}

function openInOverleaf(data) {
  const latex = createJakesResume(data);

  // Download locally
  downloadLatex(latex, `${data.name.replace(/\s+/g, '_')}_Resume.tex`);

  // Open Overleaf upload page
  window.open(
    "https://www.overleaf.com/project/",
    "_blank"
  );
}



function createJakesResume(data) {
    let latex = `%-------------------------
% Resume in LaTeX
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${escapeLatex(data.name)}} \\\\ \\vspace{1pt}
    \\small ${escapeLatex(data.phone)} $|$ \\href{mailto:${data.email}}{\\underline{${escapeLatex(data.email)}}}`;

    if (data.linkedin) {
        const linkedinUsername = data.linkedin.split('/').pop();
        latex += ` $|$ \\href{${data.linkedin}}{\\underline{linkedin.com/in/${linkedinUsername}}}`;
    }
    if (data.github) {
        const githubUsername = data.github.split('/').pop();
        latex += ` $|$ \\href{${data.github}}{\\underline{github.com/${githubUsername}}}`;
    }
    if (data.website) {
        latex += ` $|$ \\href{${data.website}}{\\underline{${data.website.replace('https://', '').replace('http://', '')}}}`;
    }

    latex += `
\\end{center}

`;

    if (data.education.length > 0) {
        latex += `\\section{Education}
  \\resumeSubHeadingListStart
`;
        data.education.forEach(edu => {
            latex += `    \\resumeSubheading
      {${escapeLatex(edu.institution)}}{${escapeLatex(edu.duration)}}
      {${escapeLatex(edu.degree)}}{${escapeLatex(edu.gpa)}}
`;
        });
        latex += `  \\resumeSubHeadingListEnd

`;
    }

    if (data.experience.length > 0) {
        latex += `\\section{Experience}
  \\resumeSubHeadingListStart
`;
        data.experience.forEach(exp => {
            latex += `    \\resumeSubheading
      {${escapeLatex(exp.position)}}{${escapeLatex(exp.duration)}}
      {${escapeLatex(exp.company)}}{${escapeLatex(exp.location)}}
      \\resumeItemListStart
`;
            const items = exp.description.split('\n').filter(line => line.trim());
            items.forEach(item => {
                const cleanItem = item.trim().replace(/^[•\-\*]\s*/, '');
                if (cleanItem) {
                    latex += `        \\resumeItem{${escapeLatex(cleanItem)}}
`;
                }
            });
            latex += `      \\resumeItemListEnd
`;
        });
        latex += `  \\resumeSubHeadingListEnd

`;
    }

    if (data.projects.length > 0) {
        latex += `\\section{Projects}
    \\resumeSubHeadingListStart
`;
        data.projects.forEach(proj => {
            const projHeader = proj.link 
                ? `\\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${escapeLatex(proj.tech)}} $|$ \\href{${proj.link}}{\\underline{Link}}`
                : `\\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${escapeLatex(proj.tech)}}`;
            
            latex += `      \\resumeProjectHeading
          {${projHeader}}{}
          \\resumeItemListStart
`;
            const items = proj.description.split('\n').filter(line => line.trim());
            items.forEach(item => {
                const cleanItem = item.trim().replace(/^[•\-\*]\s*/, '');
                if (cleanItem) {
                    latex += `            \\resumeItem{${escapeLatex(cleanItem)}}
`;
                }
            });
            latex += `          \\resumeItemListEnd
`;
        });
        latex += `    \\resumeSubHeadingListEnd

`;
    }

    latex += `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
`;
    if (data.languages) latex += `     \\textbf{Languages}{: ${escapeLatex(data.languages)}} \\\\
`;
    if (data.frameworks) latex += `     \\textbf{Frameworks}{: ${escapeLatex(data.frameworks)}} \\\\
`;
    if (data.tools) latex += `     \\textbf{Developer Tools}{: ${escapeLatex(data.tools)}} \\\\
`;
    if (data.libraries) latex += `     \\textbf{Libraries}{: ${escapeLatex(data.libraries)}}
`;
    latex += `    }}
 \\end{itemize}

\\end{document}`;

    return latex;
}

function escapeLatex(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/[&%$#_{}]/g, '\\$&')
        .replace(/~/g, '\\~{}')
        .replace(/\^/g, '\\^{}');
}

function downloadLatex(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('✓ LaTeX resume generated! Upload to Overleaf.com to compile it into a PDF.');
}

// Initialize with one of each section
addEducation();
addExperience();
addProject();