// ============================================
// Skills Data
// ============================================

export const skills = {
  frontend: [
    { name: 'Python', level: 'AI/ML & Scripting' },
    { name: 'PyTorch', level: 'Deep Learning' },
    { name: 'TensorFlow', level: 'Deep Learning' },
    { name: 'Transformers', level: 'NLP / LLMs' },
    { name: 'OpenCV', level: 'Computer Vision' },
    { name: 'YOLO', level: 'Object Detection' },
    { name: 'NLP', level: 'Natural Language Processing' },
    { name: 'Generative AI', level: 'LLMs & Gen AI' },
    { name: 'Hugging Face', level: 'Model Hub & Pipelines' },
  ],
  backend: [
    { name: 'Java', level: 'Backend / OOP' },
    { name: 'JavaScript', level: 'Full Stack' },
    { name: 'React.js', level: 'Frontend Framework' },
    { name: 'Node.js', level: 'Backend Runtime' },
    { name: 'Express.js', level: 'REST APIs' },
    { name: 'Flask', level: 'Python Backend' },
    { name: 'HTML / CSS', level: 'Web Fundamentals' },
    { name: 'Tailwind CSS', level: 'Utility-First Styling' },
    { name: 'REST APIs', level: 'API Design' },
  ],
  tools: [
    { name: 'MongoDB', level: 'NoSQL Database' },
    { name: 'Firebase', level: 'Backend-as-a-Service' },
    { name: 'MySQL', level: 'Relational Database' },
    { name: 'Git', level: 'Version Control' },
    { name: 'GitHub', level: 'Collaboration & CI/CD' },
    { name: 'Docker', level: 'Containerization' },
    { name: 'Oracle Cloud', level: 'Cloud Platform' },
    { name: 'Postman', level: 'API Testing' },
    { name: 'Jupyter Notebook', level: 'Data & ML Experiments' },
  ],
};

// ============================================
// Projects Data
// ============================================

export const projects = [
  {
    title: 'FootprintX — Digital Footprint & Privacy Risk Analyzer',
    description: 'Engineered an AI-powered privacy management platform for digital footprint assessment and personalized privacy risk recommendations.',
    stack: ['React.js', 'Node.js', 'MongoDB', 'Python'],
    githubUrl: 'https://github.com/YashMhasekar/FootPrintX',
    liveUrl: 'https://footprintx-privacy.netlify.app/',
    achievement: null,
  },
  {
    title: 'VisioTrack — AI Audio Navigation System',
    description: 'Built an AI-powered assistive navigation system with real-time object detection, OCR, and audio guidance for visually impaired users.',
    stack: ['React.js', 'Python', 'YOLO', 'OpenCV', 'Firebase'],
    githubUrl: 'https://github.com/YashMhasekar/VisioTrack',
    liveUrl: 'https://visiotrack-ai.netlify.app/',
    achievement: 'Zonal Finalist — IIT Bombay Eureka! 2025',
  },
  {
    title: 'Momentum — AI Productivity Platform',
    description: 'Built an AI-powered productivity platform with smart task management, analytics, and real-time progress tracking.',
    stack: ['React.js', 'Node.js', 'Python', 'Firebase'],
    githubUrl: 'https://github.com/YashMhasekar/Momentum',
    liveUrl: 'https://momentum01.netlify.app',
    achievement: '1st Place — HACKHIVE-2K26 National Hackathon',
  },
  {
    title: 'Feedback NLP Engine',
    description: 'Built a full-stack AI platform for automated student feedback analysis using sentiment classification and AI-generated insights.',
    stack: ['React.js', 'Flask', 'Python', 'Hugging Face', 'Gemini API'],
    githubUrl: 'https://github.com/YashMhasekar/feedback-nlp-engine',
    liveUrl: 'https://feedback-nlp-engine-frontend.onrender.com/',
    achievement: 'Runner-Up — Technovation 1.0 Hackathon',
  },
];
