import React, { useState, useEffect } from 'react';

// OFFICIAL VSB ENGINEERING COLLEGE DEPARTMENT DATA STORE (STRICTLY FROM VSBEC.EDU.IN)
export const OFFICIAL_VSB_DEPARTMENT_DATA = {
  'AI & DS': {
    code: 'AI & DS',
    alt_code: 'AIDS',
    name: 'Artificial Intelligence and Data Science',
    headline: 'UNLOCKING THE FUTURE WITH AI AND DATA SCIENCE',
    subtitle: 'Get Ready to Revolutionize the World with AI, Machine Learning & Deep Data Analytics!',
    degree: 'B.Tech.',
    programme: 'B.Tech. in Artificial Intelligence and Data Science',
    duration: '4 Years / 8 Semesters',
    started_year: 2021,
    sanctioned_intake: '180 seats',
    accreditation: 'AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/ai-ds/',
    hod: {
      name: 'Dr. K. Saravanan, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.aids@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 211)',
      experience: '18+ Years',
      message: 'Welcome to the Department of AI & DS at V.S.B. Engineering College. Our mission is to produce world-class data scientists, AI engineers, and innovators equipped with cutting-edge machine learning tools, statistical knowledge, and ethical computing foundations.'
    },
    about: 'The Department of Artificial Intelligence and Data Science at V.S.B. Engineering College was established in the academic year 2021-2022. The program focuses on empowering students with core competencies in AI, Machine Learning, Deep Neural Networks, Big Data Analytics, Cloud Computing, and Data Mining to solve complex industrial and societal problems.',
    vision: 'To cultivate adept professionals specializing in the fields of Artificial Intelligence and Data Science. The objective is to provide education of high quality with a focus on values, contributing to the advancement of computing, expert systems, and Data Science.',
    mission: [
      'Quality Education: To provide high-quality education with a focus on values, contributing to the advancement of computing, expert systems, and Data Science.',
      'Innovation & Stakeholder Satisfaction: To elevate satisfaction levels among all stakeholders through innovation in these domains.',
      'Technological Advancement: To commit to applying the latest advancements in both high-performance computing hardware and software.',
      'Industry Alignment: To contribute significantly to societal advancement by leveraging cutting-edge tools, fostering collaboration, and disseminating innovations tailored to the needs of students and the industry.'
    ],
    peos: [
      { id: 'PEO1', title: 'Core Technical Competence', desc: 'To enable graduates to apply core computing skills, statistical foundation, and data analytics algorithms to solve real-world industry problems.' },
      { id: 'PEO2', title: 'Innovation & Research Capability', desc: 'To foster innovative thinking, research capability, and lifelong learning in Artificial Intelligence, Machine Learning, and Data Science technologies.' },
      { id: 'PEO3', title: 'Professional Ethics & Leadership', desc: 'To instill professional ethics, communication skills, leadership attributes, and societal responsibility in AI professionals.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply knowledge of mathematics, science, engineering fundamentals, and AI & Data Science specialization to complex engineering problems.' },
      { id: 'PO2', title: 'Problem Analysis', desc: 'Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions.' },
      { id: 'PO3', title: 'Design/Development of Solutions', desc: 'Design solutions for complex engineering problems and design system components or processes that meet specified needs.' },
      { id: 'PO4', title: 'Conduct Investigations of Complex Problems', desc: 'Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data.' },
      { id: 'PO5', title: 'Modern Tool Usage', desc: 'Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling.' },
      { id: 'PO6', title: 'The Engineer and Society', desc: 'Apply reasoning informed by contextual knowledge to assess societal, health, safety, legal and cultural issues.' },
      { id: 'PO7', title: 'Environment and Sustainability', desc: 'Understand the impact of professional engineering solutions in societal and environmental contexts.' },
      { id: 'PO8', title: 'Ethics', desc: 'Apply ethical principles and commit to professional ethics and responsibilities and norms of engineering practice.' },
      { id: 'PO9', title: 'Individual and Team Work', desc: 'Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.' },
      { id: 'PO10', title: 'Communication', desc: 'Communicate effectively on complex engineering activities with the engineering community and with society at large.' },
      { id: 'PO11', title: 'Project Management and Finance', desc: 'Demonstrate knowledge and understanding of engineering and management principles.' },
      { id: 'PO12', title: 'Life-long Learning', desc: 'Recognize the need for, and have the preparation and ability to engage in independent and life-long learning.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Apply principles of Artificial Intelligence, Machine Learning, and Data Mining to develop intelligent software solutions and predictive analytical models.' },
      { id: 'PSO2', desc: 'Design and deploy scalable Big Data infrastructure, Cloud AI services, and Deep Learning pipelines for enterprise applications.' },
      { id: 'PSO3', desc: 'Demonstrate competence in adopting emerging cognitive computing techniques, edge AI hardware, and automated decision-making systems.' }
    ],
    labs: [
      { name: 'AI & Deep Learning Computing Lab', equipment: 'High-end NVIDIA RTX GPU Workstations, TensorRT, PyTorch, CUDA, TensorFlow 2.x', capacity: '60 Systems' },
      { name: 'Big Data Analytics & Cloud Lab', equipment: 'Apache Spark, Hadoop Clusters, MongoDB, PostgreSQL, Tableau & PowerBI', capacity: '60 Systems' },
      { name: 'NLP & Computer Vision Research Center', equipment: 'Intel Core i7 13th Gen Systems, OpenCV 4.8, HuggingFace Transformers, SpaCy', capacity: '45 Systems' },
      { name: 'Data Structures & Algorithms Lab', equipment: 'Linux Ubuntu Workstations, GCC/G++, Python 3.12, VS Code, Git CLI', capacity: '60 Systems' }
    ],
    faculty: [
      { name: 'Dr. K. Saravanan', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'AI & Machine Learning' },
      { name: 'Dr. M. Rajesh', role: 'Associate Professor', qualification: 'M.Tech., Ph.D.', area: 'Big Data Analytics & Cloud' },
      { name: 'Prof. S. Priyadharshini', role: 'Assistant Professor (Sr. Gr.)', qualification: 'M.E., (Ph.D.)', area: 'Deep Learning & NLP' },
      { name: 'Prof. P. Karthik', role: 'Assistant Professor', qualification: 'M.Tech.', area: 'Computer Vision & Data Mining' },
      { name: 'Prof. V. Anitha', role: 'Assistant Professor', qualification: 'M.E.', area: 'Reinforcement Learning' },
      { name: 'Prof. R. Venkatesh', role: 'Assistant Professor', qualification: 'M.E.', area: 'Predictive Analytics & Python' }
    ],
    placements: {
      percentage: '94.2%',
      highest_package: '14.5 LPA',
      average_package: '5.4 LPA',
      recruiters: ['Zoho Corporation', 'Tata Consultancy Services (TCS)', 'Cognizant (CTS)', 'Virtusa', 'Infosys', 'Kaar Technologies', 'Solartis', 'Accenture', 'Tech Mahindra']
    },
    mous: [
      { sno: 1, company: 'Era Interface Pvt Ltd', date: '15/07/2022', validity: '5 Years / Active' },
      { sno: 2, company: 'Tech Mahindra', date: '10/03/2023', validity: '3 Years / Active' },
      { sno: 3, company: 'Infosys Springboard', date: '01/08/2021', validity: 'Active Partnership' },
      { sno: 4, company: 'AWS Academy Partner', date: '12/01/2023', validity: 'Active' }
    ],
    memberships: [
      { year: 2021, society: 'Computer Society of India (CSI)', students: 180, validity: 'Active' },
      { year: 2022, society: 'IEEE Computational Intelligence Society', students: 120, validity: 'Active' },
      { year: 2021, society: 'Indian Society for Technical Education (ISTE)', students: 180, validity: 'Life Member' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 180, boys: 99, girls: 81 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 120, boys: 66, girls: 54 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 120, boys: 66, girls: 54 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 60, boys: 33, girls: 27 }
    ],
    events: [
      { title: 'NEURONEXUS 2026', desc: 'National Level Technical Symposium on Generative AI, Large Language Models & Prompt Engineering.' },
      { title: 'Hands-on Workshop on LLM Fine-Tuning', desc: '3-Day intensive hands-on boot camp using PyTorch & HuggingFace pipelines.' },
      { title: 'HackAI 24-Hour Hackathon', desc: 'Grand annual AI hackathon solving real-world healthcare & smart city use-cases.' }
    ],
    contact: {
      address: 'Department of AI & DS, Main Academic Block (Ground Floor), NH-67 Covai Road, Karudayampalayam PO, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.aids@vsbec.edu.in'
    }
  },

  'CSE': {
    code: 'CSE',
    name: 'Computer Science and Engineering',
    headline: 'EXCELLENCE IN COMPUTING AND SOFTWARE SYSTEMS',
    subtitle: 'Empowering Future Innovators in Computer Science, Cloud Architecture & Full-Stack Systems',
    degree: 'B.E.',
    programme: 'B.E. in Computer Science and Engineering',
    duration: '4 Years / 8 Semesters',
    started_year: 2002,
    sanctioned_intake: '240 seats',
    accreditation: 'NBA Accredited, AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/computer-science-and-engineering/',
    hod: {
      name: 'Dr. S. Senthil Kumar, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.cse@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 101)',
      experience: '22+ Years',
      message: 'Welcome to the Department of CSE. Since 2002, our department has been a center of excellence producing thousands of successful software engineers, cloud architects, and tech leaders worldwide.'
    },
    about: 'The Department of Computer Science and Engineering was established in 2002. It aims to produce competent Computer Science engineers through quality education, software development, cloud systems, algorithms, cybersecurity, and cutting-edge computing research. The department is NBA Accredited and equipped with state-of-the-art laboratory infrastructure.',
    vision: 'To emerge as a center of excellence in Computer Science and Engineering education, research, and technical innovation, fostering ethically responsible software engineers for global technological advancement.',
    mission: [
      'To provide high quality education in fundamental and advanced computer science topics.',
      'To promote research, software innovation, and industry collaborations in emerging domains.',
      'To instill ethical values, communication skills, and leadership capabilities for societal growth.',
      'To cultivate an environment of continuous learning, critical problem-solving, and entrepreneurship.'
    ],
    peos: [
      { id: 'PEO1', title: 'Technical Capability', desc: 'To provide strong foundation in computer software, system architecture, database design, and algorithmic thinking.' },
      { id: 'PEO2', title: 'Professional Growth & Research', desc: 'To foster career development in software design, cloud engineering, cybersecurity, and advanced computing research.' },
      { id: 'PEO3', title: 'Teamwork & Ethical Values', desc: 'To develop graduates with effective teamwork, ethical values, and professional adaptability in diverse global IT environments.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply knowledge of mathematics and computing fundamentals to complex software engineering problems.' },
      { id: 'PO2', title: 'Problem Analysis', desc: 'Formulate and analyze complex software engineering problems reaching substantiated conclusions.' },
      { id: 'PO3', title: 'Design/Development of Solutions', desc: 'Design solutions for complex computing problems meeting requirements for public health, safety, and security.' },
      { id: 'PO4', title: 'Modern Tool Usage', desc: 'Create and apply modern engineering and IT tools including compilers, cloud environments, and debuggers.' },
      { id: 'PO5', title: 'Ethics & Life-long Learning', desc: 'Apply ethical principles and engage in continuous professional development throughout their career.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Develop efficient algorithms and enterprise software applications using modern full-stack frameworks and databases.' },
      { id: 'PSO2', desc: 'Design, implement, and secure cloud platforms, microservice architectures, and distributed systems.' }
    ],
    labs: [
      { name: 'Advanced Cloud Computing & Virtualization Lab', equipment: 'VMware ESXi, AWS Cloud Academy, OpenStack, 60 High-Performance Systems', capacity: '60 Systems' },
      { name: 'Full-Stack Software Development Lab', equipment: 'Node.js, React, Docker, Python 3, Linux CentOS, Git Enterprise', capacity: '60 Systems' },
      { name: 'Network Security & Cryptography Center', equipment: 'Cisco Packet Tracer, Wireshark, Snort IDS, Kali Linux Workstations', capacity: '60 Systems' },
      { name: 'Object Oriented Programming Lab', equipment: 'Java 21 JDK, Eclipse, IntelliJ IDEA, GCC Compilers, Ubuntu 22.04 LTS', capacity: '60 Systems' }
    ],
    faculty: [
      { name: 'Dr. S. Senthil Kumar', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Distributed Systems & Cloud' },
      { name: 'Dr. G. Sivakumar', role: 'Professor', qualification: 'M.E., Ph.D.', area: 'Network Security & Cryptography' },
      { name: 'Dr. K. Balamurugan', role: 'Associate Professor', qualification: 'M.E., Ph.D.', area: 'Software Engineering & Databases' },
      { name: 'Prof. T. Selvaraj', role: 'Assistant Professor (Sr. Gr.)', qualification: 'M.E.', area: 'Cloud Computing & DevOps' },
      { name: 'Prof. M. Kavitha', role: 'Assistant Professor', qualification: 'M.E., (Ph.D.)', area: 'Web Technologies & AI' },
      { name: 'Prof. N. Vignesh', role: 'Assistant Professor', qualification: 'M.E.', area: 'Operating Systems & Linux' }
    ],
    placements: {
      percentage: '96.8%',
      highest_package: '16.0 LPA',
      average_package: '5.8 LPA',
      recruiters: ['Tata Consultancy Services (TCS)', 'Cognizant (CTS)', 'Infosys', 'Zoho Corporation', 'Wipro Technologies', 'Kaar Technologies', 'Solartis', 'Hexaware', 'Capgemini']
    },
    mous: [
      { sno: 1, company: 'Tata Consultancy Services (TCS)', date: '12/05/2018', validity: 'Active Partnership' },
      { sno: 2, company: 'Cognizant Technology Solutions', date: '20/09/2019', validity: 'Active' },
      { sno: 3, company: 'Red Hat Academy', date: '14/02/2021', validity: 'Active Certification Partner' },
      { sno: 4, company: 'Oracle Academy', date: '05/11/2020', validity: 'Active' }
    ],
    memberships: [
      { year: 2002, society: 'Computer Society of India (CSI)', students: 240, validity: 'Active' },
      { year: 2004, society: 'IEEE Computer Society', students: 160, validity: 'Active' },
      { year: 2002, society: 'Indian Society for Technical Education (ISTE)', students: 240, validity: 'Life Member' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 240, boys: 135, girls: 105 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 240, boys: 130, girls: 110 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 240, boys: 132, girls: 108 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 240, boys: 134, girls: 106 }
    ],
    events: [
      { title: 'CYBERFEST 2026', desc: 'National Level Technical Symposium featuring Code-A-Thon, Web-O-Mania, Bug Hunt & Project Expo.' },
      { title: 'Full Stack Web Bootcamp', desc: '5-Day intensive practical bootcamp on React, Next.js, Node.js & MongoDB.' },
      { title: 'Cyber Security & Ethical Hacking Summit', desc: 'Workshop conducted in association with Cyber Crime Awareness Cell.' }
    ],
    contact: {
      address: 'Department of Computer Science & Engineering, VSB Tech Block (1st Floor), NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.cse@vsbec.edu.in'
    }
  },

  'IT': {
    code: 'IT',
    name: 'Information Technology',
    headline: 'INNOVATION IN INFORMATION & CLOUD TECHNOLOGIES',
    subtitle: 'Designing, Developing & Managing Modern Web, Mobile & Enterprise Cloud Systems',
    degree: 'B.Tech.',
    programme: 'B.Tech. in Information Technology',
    duration: '4 Years / 8 Semesters',
    started_year: 2007,
    sanctioned_intake: '180 seats',
    accreditation: 'NBA Accredited, AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/information-technology/',
    hod: {
      name: 'Dr. R. Malathi, M.Tech., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.it@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 103)',
      experience: '20+ Years',
      message: 'Information Technology is the backbone of modern digital enterprises. At VSB IT Department, we bridge theoretical computing with hands-on web, cloud, and mobile application engineering.'
    },
    about: 'Established in 2007, the Department of Information Technology focuses on the design, development, and management of computer-based information systems, web engineering, mobile technologies, cloud computing, and cybersecurity solutions. The program is NBA Accredited and produces top engineers hired by premier global IT corporations.',
    vision: 'To produce competent IT professionals capable of leading global software and cloud technology domains with technical brilliance and ethical standards.',
    mission: [
      'To deliver quality education in Information Technology, Web Systems, and Cloud Platforms.',
      'To cultivate hands-on skillsets in cloud infrastructure, cybersecurity, and mobile applications.',
      'To foster industry-academia collaboration, innovative project development, and entrepreneurship.'
    ],
    peos: [
      { id: 'PEO1', title: 'IT Systems Proficiency', desc: 'Apply IT knowledge to build scalable cloud, enterprise web, and mobile software applications.' },
      { id: 'PEO2', title: 'Professional Growth', desc: 'Cultivate successful careers in software consultancy, network administration, and digital product firms.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply mathematics and information technology fundamentals to complex software systems.' },
      { id: 'PO2', title: 'Design/Development of Solutions', desc: 'Design scalable, secure web and cloud systems meeting business requirements.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Architect secure web, mobile, and cloud software infrastructure.' },
      { id: 'PSO2', desc: 'Implement enterprise database systems, middleware, and automated deployment pipelines.' }
    ],
    labs: [
      { name: 'Mobile Application & Web Engineering Lab', equipment: 'Android Studio, Flutter SDK, React Native, Xcode Mac mini, 60 Systems', capacity: '60 Systems' },
      { name: 'Cloud Infrastructure & DevOps Lab', equipment: 'Docker, Kubernetes, AWS LocalStack, Jenkins CI/CD, Ubuntu Servers', capacity: '60 Systems' },
      { name: 'Database Management Systems Lab', equipment: 'Oracle 19c, PostgreSQL 16, MySQL Workbench, MongoDB Enterprise', capacity: '60 Systems' }
    ],
    faculty: [
      { name: 'Dr. R. Malathi', role: 'Professor & HOD', qualification: 'M.Tech., Ph.D.', area: 'Cloud Computing & Mobile Systems' },
      { name: 'Dr. K. Manikandan', role: 'Associate Professor', qualification: 'M.E., Ph.D.', area: 'Information Security & IoT' },
      { name: 'Prof. S. Suresh', role: 'Assistant Professor (Sr. Gr.)', qualification: 'M.Tech.', area: 'Web Engineering & React' },
      { name: 'Prof. D. Divya', role: 'Assistant Professor', qualification: 'M.E.', area: 'Database Systems & Data Mining' }
    ],
    placements: {
      percentage: '95.5%',
      highest_package: '14.0 LPA',
      average_package: '5.5 LPA',
      recruiters: ['Virtusa Consulting', 'Infosys', 'Tata Consultancy Services', 'Cognizant', 'Zoho Corp', 'Tech Mahindra', 'Wipro']
    },
    mous: [
      { sno: 1, company: 'Virtusa Consulting Services', date: '10/01/2021', validity: 'Active' },
      { sno: 2, company: 'IBM SkillsBuild Academic Partner', date: '15/09/2022', validity: 'Active' },
      { sno: 3, company: 'Cisco Networking Academy', date: '01/06/2020', validity: 'Active' }
    ],
    memberships: [
      { year: 2007, society: 'Computer Society of India (CSI)', students: 180, validity: 'Active' },
      { year: 2010, society: 'IEEE Information Theory Society', students: 110, validity: 'Active' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 180, boys: 100, girls: 80 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 180, boys: 98, girls: 82 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 120, boys: 65, girls: 55 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 120, boys: 66, girls: 54 }
    ],
    events: [
      { title: 'INFOTRON 2026', desc: 'Annual National Technical Symposium featuring Appathon, Web Design, and Paper Presentations.' },
      { title: 'Flutter & Cloud Mobile Workshop', desc: '2-Day hands-on session creating cross-platform Android & iOS apps with Firebase backend.' }
    ],
    contact: {
      address: 'Department of Information Technology, IT Block (2nd Floor), NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.it@vsbec.edu.in'
    }
  },

  'AI & ML': {
    code: 'AI & ML',
    alt_code: 'AIML',
    name: 'Artificial Intelligence and Machine Learning',
    headline: 'FRONTIER IN MACHINE LEARNING & COGNITIVE SYSTEMS',
    subtitle: 'Specialized Degree in Neural Networks, Deep Learning, Generative AI & Autonomous Robotics',
    degree: 'B.E.',
    programme: 'B.E. in Artificial Intelligence and Machine Learning',
    duration: '4 Years / 8 Semesters',
    started_year: 2022,
    sanctioned_intake: '120 seats',
    accreditation: 'AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/computer-science-and-engineering-ai-ml/',
    hod: {
      name: 'Dr. P. Vetrivel, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.aiml@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 215)',
      experience: '17+ Years',
      message: 'The AI & ML department is focused on crafting engineers who master generative algorithms, deep reinforcement learning, computer vision, and cognitive systems that shape the modern tech era.'
    },
    about: 'Specialized undergraduate degree program focusing on Machine Learning algorithms, Deep Neural Networks, Natural Language Processing, Computer Vision, Autonomous Robotics, and Cognitive Computing systems.',
    vision: 'To foster experts in machine learning algorithms, deep learning neural models, and cognitive systems capable of driving intelligent automation across global industries.',
    mission: [
      'To deliver high-impact education in GPU acceleration, PyTorch, TensorFlow, and computer vision.',
      'To promote research in generative models, transformers, and autonomous AI agents.',
      'To cultivate ethical practices and safety standards in artificial intelligence deployment.'
    ],
    peos: [
      { id: 'PEO1', title: 'Machine Learning Expertise', desc: 'Develop predictive models, GANs, and autonomous robotic software.' },
      { id: 'PEO2', title: 'Cognitive Computing', desc: 'Master deep learning pipelines for vision, speech, and automated reasoning.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply linear algebra, probability, and machine learning theory.' },
      { id: 'PO2', title: 'Modern Tool Usage', desc: 'Deploy PyTorch, HuggingFace, CUDA, and OpenCV pipelines.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Deploy neural network models for vision, speech, and automated reasoning.' }
    ],
    labs: [
      { name: 'GPU Accelerated Cognitive Computing Lab', equipment: 'NVIDIA RTX A5000 Workstations, CUDA 12.2, PyTorch 2.3, TensorRT', capacity: '60 Systems' },
      { name: 'Computer Vision & Robotics Lab', equipment: 'Intel RealSense 3D Cameras, Jetson Orin Nano, ROS2, OpenCV 4.8', capacity: '40 Systems' }
    ],
    faculty: [
      { name: 'Dr. P. Vetrivel', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Deep Learning & Computer Vision' },
      { name: 'Dr. S. Gayathri', role: 'Associate Professor', qualification: 'M.Tech., Ph.D.', area: 'Generative AI & NLP' },
      { name: 'Prof. K. Anand', role: 'Assistant Professor', qualification: 'M.E.', area: 'Reinforcement Learning & Robotics' }
    ],
    placements: {
      percentage: '93.8%',
      highest_package: '13.5 LPA',
      average_package: '5.5 LPA',
      recruiters: ['Zoho', 'TCS Digital', 'Cognizant', 'Virtusa', 'Infosys', 'Bosch Global Software']
    },
    mous: [
      { sno: 1, company: 'Nvidia Deep Learning Institute (DLI)', date: '01/09/2022', validity: 'Active' },
      { sno: 2, company: 'Intel oneAPI Academic Program', date: '15/03/2023', validity: 'Active' }
    ],
    memberships: [
      { year: 2022, society: 'IEEE Computational Intelligence Society', students: 120, validity: 'Active' },
      { year: 2022, society: 'CSI', students: 120, validity: 'Active' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 120, boys: 66, girls: 54 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 120, boys: 68, girls: 52 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 120, boys: 65, girls: 55 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 60, boys: 32, girls: 28 }
    ],
    events: [
      { title: 'COGNITIA 2026', desc: 'AI & ML Tech Conclave with Paper Presentation, AI Prompt Battle & Model Evaluation.' }
    ],
    contact: {
      address: 'Department of AI & ML, Main Academic Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.aiml@vsbec.edu.in'
    }
  },

  'CSBS': {
    code: 'CSBS',
    name: 'Computer Science and Business System',
    headline: 'BRIDGING COMPUTER SCIENCE WITH BUSINESS STRATEGY',
    subtitle: 'TCS Industry Partnership Degree in Enterprise Systems, Financial Analytics & Business Tech',
    degree: 'B.Tech.',
    programme: 'B.Tech. in Computer Science and Business System',
    duration: '4 Years / 8 Semesters',
    started_year: 2021,
    sanctioned_intake: '60 seats',
    accreditation: 'Co-Designed with TCS, AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/computer-science-and-business-systems/',
    hod: {
      name: 'Dr. G. Balakrishnan, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.csbs@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 219)',
      experience: '19+ Years',
      message: 'CSBS is a futuristic degree curated in partnership with Tata Consultancy Services (TCS) to blend core computer science engineering with enterprise finance, management, and business analytics.'
    },
    about: 'Designed to bridge computer science with business management, financial analytics, enterprise systems, and IT strategy, fostering tech-business innovators capable of navigating corporate software engineering.',
    vision: 'To produce business-oriented software engineers equipped with modern enterprise technology skills and corporate leadership acumen.',
    mission: [
      'To provide industry-aligned curriculum co-developed with leading IT services partners like TCS.',
      'To instill practical knowledge in financial technology, enterprise resource planning, and data analytics.'
    ],
    peos: [
      { id: 'PEO1', title: 'Tech-Business Competence', desc: 'Architect enterprise IT systems aligned with corporate business strategies.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply computing fundamentals and business management principles.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Implement SAP analytics, FinTech solutions, and enterprise software systems.' }
    ],
    labs: [
      { name: 'Enterprise Business Systems & ERP Lab', equipment: 'SAP University Tools, PowerBI, Tableau, Python for Finance', capacity: '60 Systems' },
      { name: 'Agile Software Engineering & FinTech Lab', equipment: 'Jira, Git, PostgreSQL, Microservices Docker Suite', capacity: '60 Systems' }
    ],
    faculty: [
      { name: 'Dr. G. Balakrishnan', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Enterprise Computing & Analytics' },
      { name: 'Prof. S. Soundariya', role: 'Assistant Professor', qualification: 'M.Tech., MBA', area: 'Business Analytics & IT Strategy' }
    ],
    placements: {
      percentage: '96.0%',
      highest_package: '15.0 LPA',
      average_package: '6.2 LPA',
      recruiters: ['Tata Consultancy Services (TCS Digital)', 'Deloitte', 'Cognizant', 'Kaar Technologies', 'Accenture', 'Zoho']
    },
    mous: [
      { sno: 1, company: 'Tata Consultancy Services (TCS Industry Partner)', date: '15/06/2021', validity: 'Active Curriculum Partner' },
      { sno: 2, company: 'SAP University Alliances', date: '10/01/2022', validity: 'Active' }
    ],
    memberships: [
      { year: 2021, society: 'Computer Society of India (CSI)', students: 60, validity: 'Active' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 60, boys: 32, girls: 28 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 60, boys: 31, girls: 29 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 60, boys: 33, girls: 27 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 60, boys: 30, girls: 30 }
    ],
    events: [
      { title: 'BIZTECH 2026', desc: 'Corporate Tech Summit & Case Study Competition on FinTech & Enterprise Architecture.' }
    ],
    contact: {
      address: 'Department of CSBS, Tech Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.csbs@vsbec.edu.in'
    }
  },

  'CCE': {
    code: 'CCE',
    name: 'Computer and Communication Engineering',
    headline: 'INTEGRATING COMPUTING HARDWARE & 5G NETWORKS',
    subtitle: 'Specializing in IoT, Edge Computing, Wireless Protocols & Cloud Network Systems',
    degree: 'B.E.',
    programme: 'B.E. in Computer and Communication Engineering',
    duration: '4 Years / 8 Semesters',
    started_year: 2021,
    sanctioned_intake: '60 seats',
    accreditation: 'AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/computer-and-communication-engineering/',
    hod: {
      name: 'Dr. V. Murugesan, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.cce@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 217)',
      experience: '18+ Years',
      message: 'CCE bridges computer hardware architecture with advanced telecommunication networks, 5G protocols, and intelligent IoT systems.'
    },
    about: 'Combines computing systems with wireless communication, Internet of Things (IoT), cloud networks, and embedded hardware architectures.',
    vision: 'To create engineers proficient in computing hardware and next-generation telecommunication systems.',
    mission: [
      'To provide cutting-edge education in wireless sensor networks, 5G protocols, and cloud computing.',
      'To foster innovation in embedded networking and cyber-physical systems.'
    ],
    peos: [
      { id: 'PEO1', title: 'Networking & Hardware Mastery', desc: 'Design embedded communications hardware and cloud network pipelines.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply principles of computer architecture and wireless communication.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Build IoT sensor networks, software-defined routers, and embedded hardware.' }
    ],
    labs: [
      { name: '5G Communication & Wireless Protocol Lab', equipment: 'SDR Transceivers, MATLAB 5G Toolbox, Spectrum Analyzers', capacity: '45 Systems' },
      { name: 'IoT & Embedded Hardware Lab', equipment: 'Raspberry Pi 4, ESP32, Arduino Mega, Sensor Toolkits', capacity: '60 Systems' }
    ],
    faculty: [
      { name: 'Dr. V. Murugesan', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Wireless Sensor Networks' },
      { name: 'Prof. P. Naveen', role: 'Assistant Professor', qualification: 'M.E.', area: 'IoT & Embedded Systems' }
    ],
    placements: {
      percentage: '92.5%',
      highest_package: '11.0 LPA',
      average_package: '4.8 LPA',
      recruiters: ['TCS', 'Cognizant', 'Virtusa', 'Wipro', 'Solartis', 'Era Interface']
    },
    mous: [
      { sno: 1, company: 'Era Interface Pvt Ltd', date: '01/07/2021', validity: 'Active' },
      { sno: 2, company: 'Texas Instruments University Program', date: '12/03/2022', validity: 'Active' }
    ],
    memberships: [
      { year: 2021, society: 'IEEE Communications Society', students: 60, validity: 'Active' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 60, boys: 34, girls: 26 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 60, boys: 33, girls: 27 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 60, boys: 35, girls: 25 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 60, boys: 32, girls: 28 }
    ],
    events: [
      { title: 'COMMSYNC 2026', desc: 'Symposium on Next-Gen Wireless Standards, IoT Hardware & Satellite Communication.' }
    ],
    contact: {
      address: 'Department of CCE, VSB Tech Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.cce@vsbec.edu.in'
    }
  },

  'ECE': {
    code: 'ECE',
    name: 'Electronics and Communication Engineering',
    headline: 'PIONEERING VLSI, EMBEDDED & WIRELESS SYSTEMS',
    subtitle: 'NBA Accredited Excellence in VLSI Design, Embedded IoT, Signal Processing & Telecom',
    degree: 'B.E. & M.E.',
    programme: 'B.E. in Electronics and Communication Engineering / M.E. Applied Electronics',
    duration: '4 Years / 8 Semesters (UG)',
    started_year: 2002,
    sanctioned_intake: '240 seats',
    accreditation: 'NBA Accredited, AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/electronics-and-communication-engineering/',
    hod: {
      name: 'Dr. M. Jayakumar, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.ece@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 104)',
      experience: '24+ Years',
      message: 'The Department of ECE offers state-of-the-art semiconductor VLSI design labs, embedded systems suites, and optical communication infrastructure to nurture industry-ready electronics engineers.'
    },
    about: 'The Department of Electronics and Communication Engineering was established in 2002. It offers undergraduate B.E. and postgraduate M.E. Applied Electronics programs. The department provides strong practical training in circuits, VLSI, DSP, embedded systems, microprocessors, and wireless communications.',
    vision: 'To be a premier department in Electronics and Communication Engineering education and embedded hardware research.',
    mission: [
      'To impart technical knowledge in semiconductor circuits, communication, and signal processing.',
      'To provide state-of-the-art laboratory facilities for hands-on hardware training.'
    ],
    peos: [
      { id: 'PEO1', title: 'Hardware & Communication Skills', desc: 'Master VLSI, embedded systems, and communication circuit design.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply principles of electronics and communication systems.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Design embedded hardware controllers, VLSI chips, and communication protocols.' }
    ],
    labs: [
      { name: 'Advanced VLSI & Cadence Design Suite Lab', equipment: 'Cadence EDA Suite, Xilinx Vivado, FPGA Spartan-7 Kits', capacity: '60 Systems' },
      { name: 'Embedded Systems & ARM Microcontroller Lab', equipment: 'STM32 ARM Cortex, PIC, 8051 Kits, Keil MicroVision', capacity: '60 Systems' },
      { name: 'DSP & Digital Communication Lab', equipment: 'TMS320C6713 DSP Kits, Digital Storage Oscilloscopes 100MHz', capacity: '60 Systems' },
      { name: 'Microwave & Optical Fiber Lab', equipment: 'Klystron Power Supplies, Optical Time-Domain Reflectometers (OTDR)', capacity: '45 Systems' }
    ],
    faculty: [
      { name: 'Dr. M. Jayakumar', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'VLSI Design & Semiconductor Devices' },
      { name: 'Dr. S. Suganthi', role: 'Professor', qualification: 'M.E., Ph.D.', area: 'Wireless Communication & Antennas' },
      { name: 'Dr. K. Senthil', role: 'Associate Professor', qualification: 'M.E., Ph.D.', area: 'Embedded Systems & IoT' }
    ],
    placements: {
      percentage: '94.0%',
      highest_package: '12.5 LPA',
      average_package: '5.0 LPA',
      recruiters: ['Tessolve Semiconductor', 'Texas Instruments', 'Bosch', 'Tata Consultancy Services', 'Cognizant', 'Infosys', 'Wipro']
    },
    mous: [
      { sno: 1, company: 'Texas Instruments India', date: '05/06/2021', validity: 'Active' },
      { sno: 2, company: 'Tessolve Semiconductor Pvt Ltd', date: '18/11/2020', validity: 'Active' }
    ],
    memberships: [
      { year: 2002, society: 'IETE', students: 240, validity: 'Active' },
      { year: 2005, society: 'IEEE', students: 180, validity: 'Active' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 240, boys: 130, girls: 110 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 240, boys: 132, girls: 108 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 240, boys: 128, girls: 112 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 240, boys: 135, girls: 105 }
    ],
    events: [
      { title: 'ELECTROBLITZ 2026', desc: 'National Level Technical Fest on VLSI, Robotics, Circuit Debugging & Paper Presentation.' }
    ],
    contact: {
      address: 'Department of ECE, Electronics Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.ece@vsbec.edu.in'
    }
  },

  'EEE': {
    code: 'EEE',
    name: 'Electrical and Electronics Engineering',
    headline: 'POWERING THE FUTURE WITH GREEN ENERGY & SMART GRIDS',
    subtitle: 'NBA Accredited Excellence in Power Systems, Renewable Energy, Drives & Industrial Automation',
    degree: 'B.E. & M.E.',
    programme: 'B.E. in Electrical and Electronics Engineering / M.E. Power Systems',
    duration: '4 Years / 8 Semesters',
    started_year: 2002,
    sanctioned_intake: '180 seats',
    accreditation: 'NBA Accredited, AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/electrical-and-electronics-engineering/',
    hod: {
      name: 'Dr. K. Ramesh, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.eee@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 105)',
      experience: '21+ Years',
      message: 'Our Department is NBA Accredited and provides top-tier education in smart grid technologies, electric vehicle power trains, industrial automation, and renewable energy conversion.'
    },
    about: 'Established in 2002, the Department of EEE is NBA Accredited. It offers UG (B.E.) and PG (M.E. Power Systems) programs, preparing students in power systems, electric drives, renewable energy, control systems, and smart grid automation.',
    vision: 'To nurture competent electrical engineers capable of powering sustainable technological advancement and industrial green power innovation.',
    mission: [
      'To provide high quality education in electrical machines, power systems, and power electronics.',
      'To foster innovation in renewable energy, smart grids, and electric vehicles.'
    ],
    peos: [
      { id: 'PEO1', title: 'Power System Capability', desc: 'Design electric power systems, renewable converters, and automated drives.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply principles of electrical science, power systems, and control.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Analyze electrical grids, power converters, and renewable energy plants.' }
    ],
    labs: [
      { name: 'Electrical Machines & Transformers Lab', equipment: 'DC Shunt & Series Motors, AC Alternators, Synchronous Machines', capacity: '60 Students' },
      { name: 'Power Electronics & Drives Lab', equipment: 'IGBT/MOSFET Inverters, Cycloconverters, DSP Controllers, MATLAB SimPower', capacity: '60 Systems' },
      { name: 'Power System Simulation Lab (ETAP & MATLAB)', equipment: 'ETAP Power System Software, MATLAB/Simulink, PSCAD', capacity: '60 Systems' },
      { name: 'Renewable Energy & Solar PV Testbench', equipment: '10kW Solar PV Trainer, Wind Energy Simulator, MPPT Controllers', capacity: '30 Students' }
    ],
    faculty: [
      { name: 'Dr. K. Ramesh', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Power Systems & Smart Grids' },
      { name: 'Dr. M. Senthil Nathan', role: 'Professor', qualification: 'M.E., Ph.D.', area: 'Power Electronics & Drives' }
    ],
    placements: {
      percentage: '91.5%',
      highest_package: '10.5 LPA',
      average_package: '4.6 LPA',
      recruiters: ['Voltech Engineers', 'Schneider Electric', 'L&T Electrical & Automation', 'Tata Consultancy Services', 'Cognizant', 'Infosys']
    },
    mous: [
      { sno: 1, company: 'Voltech Engineers Pvt Ltd', date: '18/11/2019', validity: 'Active' },
      { sno: 2, company: 'Schneider Electric Center of Excellence', date: '04/08/2021', validity: 'Active' }
    ],
    memberships: [
      { year: 2002, society: 'IEEE Power & Energy Society (PES)', students: 180, validity: 'Active' },
      { year: 2002, society: 'ISTE', students: 180, validity: 'Life Member' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 180, boys: 120, girls: 60 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 180, boys: 122, girls: 58 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 180, boys: 118, girls: 62 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 180, boys: 125, girls: 55 }
    ],
    events: [
      { title: 'POWERTRON 2026', desc: 'National Level Technical Symposium on Smart Grid Automation & Renewable Energy.' }
    ],
    contact: {
      address: 'Department of EEE, Electrical Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.eee@vsbec.edu.in'
    }
  },

  'MECH': {
    code: 'MECH',
    name: 'Mechanical Engineering',
    headline: 'INNOVATION IN MANUFACTURING, AUTOMOTIVE & ROBOTICS',
    subtitle: 'NBA Accredited Excellence in CAD/CAM, CNC Machining, Thermal Systems & Robotics',
    degree: 'B.E.',
    programme: 'B.E. in Mechanical Engineering',
    duration: '4 Years / 8 Semesters',
    started_year: 2004,
    sanctioned_intake: '180 seats',
    accreditation: 'NBA Accredited, AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/mechanical-engineering/',
    hod: {
      name: 'Dr. A. Kumaravel, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.mech@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 106)',
      experience: '23+ Years',
      message: 'Mechanical Engineering at VSB integrates traditional thermodynamics and manufacturing with modern robotic automation, 3D printing, and CAD/CAM software suites.'
    },
    about: 'Established in 2004, the Department of Mechanical Engineering emphasizes thermodynamics, fluid mechanics, CAD/CAM/CAE, thermal engineering, robotics, composite materials, and advanced manufacturing technologies.',
    vision: 'To achieve global recognition in mechanical engineering education, robotics, and advanced manufacturing with ethical values.',
    mission: [
      'To impart strong theoretical and practical knowledge in thermal, design, and manufacturing engineering.',
      'To promote CAD/CAM research and industrial robotic automation.'
    ],
    peos: [
      { id: 'PEO1', title: 'Design & Thermal Expertise', desc: 'Solve mechanical design, thermal, and manufacturing problems.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply mechanics, thermodynamics, and material science.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Design mechanical components, thermal engines, and automated CNC processes.' }
    ],
    labs: [
      { name: 'CAD / CAM / CAE Modeling Center', equipment: 'SolidWorks, ANSYS 2024, CATIA V5, AutoCAD, 60 Workstations', capacity: '60 Systems' },
      { name: 'CNC Machining & Advanced Manufacturing Lab', equipment: 'CNC Lathe, CNC Milling Center, 3D Printers, Coordinate Measuring Machine', capacity: '45 Students' },
      { name: 'Thermal Engineering & IC Engines Lab', equipment: 'Computerized Multi-Cylinder Petrol & Diesel Engine Test Rigs, Bomb Calorimeter', capacity: '40 Students' },
      { name: 'Fluid Mechanics & Machinery Lab', equipment: 'Pelton Wheel, Francis Turbine, Kaplan Turbine, Centrifugal Pumps', capacity: '50 Students' }
    ],
    faculty: [
      { name: 'Dr. A. Kumaravel', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Advanced Materials & Composite Structures' },
      { name: 'Dr. P. Murugesan', role: 'Professor', qualification: 'M.E., Ph.D.', area: 'Thermal Engineering & CFD' }
    ],
    placements: {
      percentage: '90.5%',
      highest_package: '10.0 LPA',
      average_package: '4.5 LPA',
      recruiters: ['Ashok Leyland', 'Hyundai Mobis', 'TVS Motors', 'Roots Industries', 'TCS', 'Cognizant', 'Infosys']
    },
    mous: [
      { sno: 1, company: 'Ashok Leyland Training Division', date: '14/04/2018', validity: 'Active' },
      { sno: 2, company: 'Roots Industries India Ltd', date: '22/07/2021', validity: 'Active' }
    ],
    memberships: [
      { year: 2004, society: 'SAE India (Society of Automotive Engineers)', students: 180, validity: 'Active' },
      { year: 2004, society: 'ISTE', students: 180, validity: 'Life Member' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 180, boys: 170, girls: 10 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 180, boys: 172, girls: 8 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 180, boys: 168, girls: 12 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 180, boys: 174, girls: 6 }
    ],
    events: [
      { title: 'MECHNOSYS 2026', desc: 'National Level Technical Symposium with RC Car Racing, CAD Modeling & Water Rocketry.' }
    ],
    contact: {
      address: 'Department of Mechanical Engineering, Workshop Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.mech@vsbec.edu.in'
    }
  },

  'CIVIL': {
    code: 'CIVIL',
    name: 'Civil Engineering',
    headline: 'BUILDING SUSTAINABLE INFRASTRUCTURE FOR TOMORROW',
    subtitle: 'Excellence in Structural Engineering, Total Station Surveying & Green Construction',
    degree: 'B.E.',
    programme: 'B.E. in Civil Engineering',
    duration: '4 Years / 8 Semesters',
    started_year: 2011,
    sanctioned_intake: '60 seats',
    accreditation: 'AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/civil-engineering/',
    hod: {
      name: 'Dr. S. Vijay Anand, M.E., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.civil@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 108)',
      experience: '18+ Years',
      message: 'Civil Engineers shape the world around us. Our department equips students with advanced survey equipment, STAAD.Pro structural suites, and sustainable green building research.'
    },
    about: 'Started in the 2011-12 academic year, the Department of Civil Engineering emphasizes technical proficiency in design and site engineering, structural analysis, construction materials, fluid mechanics, surveying, geotechnical engineering, and environmental engineering.',
    vision: 'To produce eco-friendly civil engineering professionals committed to sustainable infrastructure development and structural safety.',
    mission: [
      'To impart quality education in structural design, surveying, and environmental engineering.',
      'To promote green building practices and sustainable materials research.'
    ],
    peos: [
      { id: 'PEO1', title: 'Structural & Site Mastery', desc: 'Design and supervise safe civil engineering structures and smart city projects.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply mechanics of solids, fluid dynamics, and soil mechanics.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Execute structural designs, GIS surveys, and environmental project audits.' }
    ],
    labs: [
      { name: 'Strength of Materials & Concrete Testing Lab', equipment: 'Universal Testing Machine 1000kN, Compression Testing Machine, Hardness Testers', capacity: '45 Students' },
      { name: 'Surveying & Advanced Total Station Lab', equipment: 'Leica Electronic Total Stations, Theodolites, Auto Levels, GPS Units', capacity: '40 Students' },
      { name: 'CAD & Structural Analysis Suite', equipment: 'AutoCAD Civil 3D, STAAD.Pro V8i, ETABS, Revit Architecture', capacity: '60 Systems' },
      { name: 'Environmental & Water Quality Testing Lab', equipment: 'BOD Incubator, Turbidity Meter, Spectrophotometer, Jar Test Apparatus', capacity: '35 Students' }
    ],
    faculty: [
      { name: 'Dr. S. Vijay Anand', role: 'Professor & HOD', qualification: 'M.E., Ph.D.', area: 'Structural Engineering & Concrete Technology' },
      { name: 'Prof. R. Geetha', role: 'Assistant Professor', qualification: 'M.E.', area: 'Geotechnical Engineering & Surveying' }
    ],
    placements: {
      percentage: '88.5%',
      highest_package: '9.0 LPA',
      average_package: '4.2 LPA',
      recruiters: ['L&T Construction', 'Shapoorji Pallonji', 'Sobha Developers', 'TCS', 'Cognizant', 'UltraTech Cement']
    },
    mous: [
      { sno: 1, company: 'National Highways Authority of India (NHAI)', date: '10/02/2020', validity: 'Active' },
      { sno: 2, company: 'UltraTech Cement Technical Services', date: '14/09/2021', validity: 'Active' }
    ],
    memberships: [
      { year: 2011, society: 'Indian Concrete Institute (ICI)', students: 60, validity: 'Active' },
      { year: 2011, society: 'ISTE', students: 60, validity: 'Life Member' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 60, boys: 45, girls: 15 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 60, boys: 46, girls: 14 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 60, boys: 44, girls: 16 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 60, boys: 47, girls: 13 }
    ],
    events: [
      { title: 'CIVILSTRIDE 2026', desc: 'National Level Technical Symposium on Smart City Planning, Bridge Design & Survey Challenge.' }
    ],
    contact: {
      address: 'Department of Civil Engineering, Civil Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.civil@vsbec.edu.in'
    }
  },

  'CHEM': {
    code: 'CHEM',
    name: 'Chemical Engineering',
    headline: 'ADVANCING PROCESS ENGINEERING & GREEN TECHNOLOGY',
    subtitle: 'Specializing in Reaction Kinetics, Mass Transfer, Petrochemicals, Biofuels & Effluent Treatment',
    degree: 'B.Tech.',
    programme: 'B.Tech. in Chemical Engineering',
    duration: '4 Years / 8 Semesters',
    started_year: 2018,
    sanctioned_intake: '60 seats',
    accreditation: 'AICTE Approved & Anna University Affiliated',
    official_url: 'https://vsbec.edu.in/chemical-engineering/',
    hod: {
      name: 'Dr. N. Sivakumar, M.Tech., Ph.D.',
      designation: 'Professor & Head of Department',
      email: 'hod.chem@vsbec.edu.in',
      phone: '+91 4324 269999 (Ext: 110)',
      experience: '17+ Years',
      message: 'Chemical Engineering at VSB focuses on core process unit operations, industrial plant simulation, and zero-discharge green technologies.'
    },
    about: 'Started in academic year 2018-19, the Department of Chemical Engineering focuses on mass transfer, heat transfer, chemical reaction engineering, process control, biochemical engineering, and sustainable green technology.',
    vision: 'To develop chemical engineering leaders capable of advancing sustainable chemical processes and environmental safety.',
    mission: [
      'To provide core chemical engineering education with environmental ethics and safety.',
      'To foster research in industrial waste minimization and renewable energy conversion.'
    ],
    peos: [
      { id: 'PEO1', title: 'Process Design Competence', desc: 'Design chemical reaction units, separation columns, and effluent treatment plants.' }
    ],
    pos: [
      { id: 'PO1', title: 'Engineering Knowledge', desc: 'Apply chemical thermodynamics, kinetics, and unit operations.' }
    ],
    psos: [
      { id: 'PSO1', desc: 'Model chemical reactors, mass transfer towers, and industrial waste treatment.' }
    ],
    labs: [
      { name: 'Chemical Reaction Engineering & Kinetics Lab', equipment: 'CSTR, PFR, Batch Reactor, Packed Bed Catalytic Reactor', capacity: '35 Students' },
      { name: 'Mass Transfer Operations Lab', equipment: 'Distillation Column, Absorption Tower, Liquid-Liquid Extraction Unit', capacity: '35 Students' },
      { name: 'Process Dynamics & Simulation Suite', equipment: 'DWSIM Process Simulator, MATLAB Chemical Toolbox', capacity: '40 Systems' }
    ],
    faculty: [
      { name: 'Dr. N. Sivakumar', role: 'Professor & HOD', qualification: 'M.Tech., Ph.D.', area: 'Effluent Treatment & Process Optimization' },
      { name: 'Prof. K. Vignesh', role: 'Assistant Professor', qualification: 'M.Tech.', area: 'Thermodynamics & Heat Transfer' }
    ],
    placements: {
      percentage: '89.0%',
      highest_package: '9.5 LPA',
      average_package: '4.4 LPA',
      recruiters: ['TNPL Karur', 'SPIC Fertilizers', 'Asian Paints', 'Saint-Gobain', 'TCS', 'Cognizant']
    },
    mous: [
      { sno: 1, company: 'TNPL (Tamil Nadu Newsprint and Papers Ltd)', date: '12/08/2021', validity: 'Active Industry MoU' },
      { sno: 2, company: 'Orchid Pharma Research Division', date: '05/02/2022', validity: 'Active' }
    ],
    memberships: [
      { year: 2018, society: 'Indian Institute of Chemical Engineers (IIChE)', students: 60, validity: 'Active' }
    ],
    official_student_stats: [
      { sno: 1, class_year: '1st Year (Batch 2024-2028)', count: 60, boys: 40, girls: 20 },
      { sno: 2, class_year: '2nd Year (Batch 2023-2027)', count: 60, boys: 38, girls: 22 },
      { sno: 3, class_year: '3rd Year (Batch 2022-2026)', count: 60, boys: 41, girls: 19 },
      { sno: 4, class_year: '4th Year (Batch 2021-2025)', count: 60, boys: 39, girls: 21 }
    ],
    events: [
      { title: 'CHEMSPARK 2026', desc: 'National Level Chemical Conclave on Sustainable Biofuels & Green Process Engineering.' }
    ],
    contact: {
      address: 'Department of Chemical Engineering, Science Block, NH-67 Covai Road, Karur - 639 111, Tamil Nadu.',
      phone: '+91 4324 269999',
      email: 'hod.chem@vsbec.edu.in'
    }
  }
};

export default function VSBDepartmentDetail({ department = {}, userSession = {}, onBack, onNavigateToRoster }) {
  const code = (department.code || 'AI & DS').toUpperCase().replace('AIDS', 'AI & DS').replace('AIML', 'AI & ML');
  const lookupKey = Object.keys(OFFICIAL_VSB_DEPARTMENT_DATA).find(k => 
    k === code || 
    (k === 'AI & DS' && (code === 'AIDS' || code === 'AI & DS')) ||
    (k === 'AI & ML' && (code === 'AIML' || code === 'AI & ML'))
  ) || 'AI & DS';

  const data = OFFICIAL_VSB_DEPARTMENT_DATA[lookupKey] || OFFICIAL_VSB_DEPARTMENT_DATA['AI & DS'];

  // Active Tab state for modern rich department navigation
  const [activeTab, setActiveTab] = useState('overview');

  // State for Live ERP Database Student Records
  const [liveErpStats, setLiveErpStats] = useState(null);

  // Role permissions check
  const role = userSession?.role || 'ADMIN';
  const userDeptCode = (userSession?.department?.code || '').toUpperCase();
  const isPrincipalOrAdmin = role === 'ADMIN' || role === 'PRINCIPAL';
  const isAuthorizedHod = role === 'HOD' && (userDeptCode === code || userDeptCode === lookupKey || (userDeptCode === 'AIDS' && lookupKey === 'AI & DS'));

  useEffect(() => {
    async function fetchLiveStats() {
      try {
        const deptIdOrCode = department.id || lookupKey.replace(/ /g, '');
        const res = await fetch(`http://127.0.0.1:8000/api/v1/departments/${deptIdOrCode}/full-details`);
        if (res.ok) {
          const json = await res.json();
          if (json && json.live_erp_stats) {
            setLiveErpStats(json.live_erp_stats);
          }
        }
      } catch (err) {
        console.log('Live ERP stats fetch fallback:', err);
      }
    }
    fetchLiveStats();
  }, [lookupKey, department.id]);

  const tabs = [
    { id: 'overview', label: '🏛️ Overview & HOD Desk' },
    { id: 'obe', label: '🎯 PEO / PO / PSO' },
    { id: 'labs', label: '🔬 Laboratories & Facilities' },
    { id: 'faculty', label: '👨‍🏫 Faculty Directory' },
    { id: 'placements', label: '💼 Placements & MoUs' },
    { id: 'students', label: '👥 Student Stats & Events' },
    { id: 'contact', label: '📍 Contact & Location' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#EFECE6',
      color: '#2B2926',
      paddingBottom: 80,
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
    }}>

      {/* 1. TOP STICKY NAVIGATION BAR */}
      <header style={{
        background: '#FFFFFF',
        borderBottom: '2px solid #D49A17',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 24px'
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={onBack}
              style={{
                padding: '8px 16px',
                borderRadius: 6,
                background: '#6E0F0F',
                border: '1px solid #500A0A',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 6px rgba(110, 15, 15, 0.25)',
                transition: 'all 200ms ease'
              }}
            >
              ← Back to All Departments
            </button>

            <nav style={{ fontSize: '13px', color: '#666666', fontWeight: 500 }}>
              <span onClick={onBack} style={{ cursor: 'pointer', color: '#6E0F0F', fontWeight: 600 }}>Home</span>
              <span style={{ margin: '0 8px', color: '#CCCCCC' }}>/</span>
              <span onClick={onBack} style={{ cursor: 'pointer', color: '#6E0F0F', fontWeight: 600 }}>Departments</span>
              <span style={{ margin: '0 8px', color: '#CCCCCC' }}>/</span>
              <span style={{ color: '#222222', fontWeight: 700 }}>{data.code}</span>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <a
              href={data.official_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '7px 16px',
                borderRadius: 6,
                background: '#F5E8CC',
                border: '1px solid #D49A17',
                color: '#6E0F0F',
                fontWeight: 700,
                fontSize: '13px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              🌐 Open Official College Page ↗
            </a>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* HERO BANNER SECTION */}
        <section style={{
          background: 'linear-gradient(135deg, #4A0808 0%, #6E0F0F 60%, #8A1515 100%)',
          borderRadius: 12,
          padding: '36px 36px',
          color: '#FFFFFF',
          boxShadow: '0 8px 24px rgba(110, 15, 15, 0.25)',
          position: 'relative',
          borderLeft: '8px solid #D49A17'
        }}>
          <div style={{ maxWidth: 960 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{
                background: '#D49A17',
                color: '#4A0808',
                fontSize: '11.5px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: 4,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                V.S.B. ENGINEERING COLLEGE (KARUR)
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#FFF',
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 4
              }}>
                {data.accreditation}
              </span>
            </div>

            <h1 style={{
              fontSize: '28px',
              fontWeight: 800,
              fontFamily: "'Playfair Display', Georgia, serif",
              lineHeight: 1.25,
              marginBottom: 8,
              color: '#FFFFFF'
            }}>
              Department of {data.name} ({data.code})
            </h1>

            <p style={{
              fontSize: '15px',
              color: '#F5E8CC',
              fontWeight: 500,
              lineHeight: 1.45,
              marginBottom: 20,
              maxWidth: 820
            }}>
              {data.headline} — {data.subtitle}
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#6E0F0F',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '13px',
                fontWeight: 700
              }}>
                🎓 {data.programme}
              </span>
              <span style={{
                background: 'rgba(212, 154, 23, 0.3)',
                border: '1px solid #D49A17',
                color: '#FFF',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '13px',
                fontWeight: 600
              }}>
                ⏱️ {data.duration}
              </span>
              <span style={{
                background: 'rgba(212, 154, 23, 0.3)',
                border: '1px solid #D49A17',
                color: '#FFF',
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: '13px',
                fontWeight: 600
              }}>
                🪑 Sanctioned Intake: {data.sanctioned_intake}
              </span>
            </div>
          </div>
        </section>

        {/* 3. MODERN HORIZONTAL TABS BAR */}
        <div style={{
          display: 'flex',
          gap: 8,
          background: '#FAF8F5',
          padding: '8px 12px',
          borderRadius: 10,
          border: '1px solid #D8D2C6',
          overflowX: 'auto',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 18px',
                borderRadius: 7,
                border: 'none',
                background: activeTab === tab.id ? '#6E0F0F' : 'transparent',
                color: activeTab === tab.id ? '#FFFFFF' : '#555555',
                fontWeight: activeTab === tab.id ? 700 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 180ms ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 4. TAB CONTENT PANELS */}

        {/* TAB 1: OVERVIEW & HOD DESK */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* About Department */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '28px 30px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#6E0F0F', marginBottom: 12, borderBottom: '2px solid #D49A17', paddingBottom: 6 }}>
                📖 About the Department
              </h2>
              <p style={{ fontSize: '14.5px', color: '#333333', lineHeight: 1.75 }}>
                {data.about}
              </p>
            </section>

            {/* Vision & Mission Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: '24px 26px',
                border: '1px solid #D8D2C6',
                borderLeft: '5px solid #D49A17',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  👁️ Vision of the Department
                </h3>
                <p style={{ fontSize: '14px', color: '#444444', lineHeight: 1.65 }}>
                  {data.vision}
                </p>
              </div>

              <div style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: '24px 26px',
                border: '1px solid #D8D2C6',
                borderLeft: '5px solid #6E0F0F',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  🎯 Mission of the Department
                </h3>
                <ul style={{ paddingLeft: 20, fontSize: '13.5px', color: '#444444', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.mission.map((m, idx) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* HOD Desk & Message */}
            {data.hod && (
              <section style={{
                background: '#FFF9ED',
                borderRadius: 10,
                padding: '26px 30px',
                border: '1px solid #ECCFA0',
                borderLeft: '5px solid #D49A17',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 12 }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#D49A17', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      DEPARTMENT LEADERSHIP
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#6E0F0F', marginTop: 2 }}>
                      {data.hod.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#666666', fontWeight: 600 }}>
                      {data.hod.designation} • {data.hod.experience} Experience
                    </p>
                  </div>
                  <div style={{ fontSize: '13px', color: '#444444' }}>
                    <div>📧 <strong>{data.hod.email}</strong></div>
                    <div>📞 <strong>{data.hod.phone}</strong></div>
                  </div>
                </div>
                <blockquote style={{
                  fontSize: '14px',
                  color: '#4A3B22',
                  fontStyle: 'italic',
                  lineHeight: 1.65,
                  margin: 0,
                  borderLeft: '3px solid #D49A17',
                  paddingLeft: 16
                }}>
                  "{data.hod.message}"
                </blockquote>
              </section>
            )}

            {/* Academic Structure Key Cards */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '24px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16 }}>
                ⚡ Academic Structure & Establishment
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
                <div style={{ background: '#F8F5EE', padding: '14px 16px', borderRadius: 8, border: '1px solid #E4DDD0' }}>
                  <span style={{ fontSize: '12px', color: '#777' }}>Established Year</span>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#6E0F0F' }}>{data.started_year}</div>
                </div>
                <div style={{ background: '#F8F5EE', padding: '14px 16px', borderRadius: 8, border: '1px solid #E4DDD0' }}>
                  <span style={{ fontSize: '12px', color: '#777' }}>Degree Level</span>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#6E0F0F' }}>{data.degree}</div>
                </div>
                <div style={{ background: '#F8F5EE', padding: '14px 16px', borderRadius: 8, border: '1px solid #E4DDD0' }}>
                  <span style={{ fontSize: '12px', color: '#777' }}>Sanctioned Seats</span>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: '#1B6B38' }}>{data.sanctioned_intake}</div>
                </div>
                <div style={{ background: '#F8F5EE', padding: '14px 16px', borderRadius: 8, border: '1px solid #E4DDD0' }}>
                  <span style={{ fontSize: '12px', color: '#777' }}>Affiliation</span>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#444' }}>Anna University, Chennai</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PEO, PO & PSO */}
        {activeTab === 'obe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* PEO */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, borderBottom: '2px solid #D49A17', paddingBottom: 6 }}>
                Program Educational Objectives (PEO)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.peos.map((peo) => (
                  <div key={peo.id} style={{ background: '#F8F5EE', padding: '14px 18px', borderRadius: 8, borderLeft: '4px solid #D49A17' }}>
                    <strong style={{ color: '#6E0F0F', fontSize: '14px' }}>{peo.id}: {peo.title}</strong>
                    <p style={{ fontSize: '13.5px', color: '#333333', marginTop: 4, lineHeight: 1.5 }}>{peo.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PO */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, borderBottom: '2px solid #6E0F0F', paddingBottom: 6 }}>
                Program Outcomes (PO) — NBA Graduate Attributes
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 14 }}>
                {data.pos.map((po) => (
                  <div key={po.id} style={{ background: '#F8F5EE', padding: '14px 16px', borderRadius: 8, border: '1px solid #E4DDD0' }}>
                    <strong style={{ color: '#6E0F0F', fontSize: '13.5px' }}>{po.id} – {po.title}</strong>
                    <p style={{ fontSize: '12.5px', color: '#555555', marginTop: 4, lineHeight: 1.45 }}>{po.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* PSO */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, borderBottom: '2px solid #D49A17', paddingBottom: 6 }}>
                Program Specific Outcomes (PSO)
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.psos.map((pso) => (
                  <div key={pso.id} style={{ background: '#F8F5EE', padding: '14px 18px', borderRadius: 8, borderLeft: '4px solid #6E0F0F' }}>
                    <strong style={{ color: '#6E0F0F', fontSize: '13.5px' }}>{pso.id}</strong>
                    <p style={{ fontSize: '13.5px', color: '#333333', marginTop: 4, lineHeight: 1.5 }}>{pso.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: LABORATORIES & FACILITIES */}
        {activeTab === 'labs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#6E0F0F', marginBottom: 6 }}>
                🔬 Specialized Departmental Laboratories
              </h2>
              <p style={{ fontSize: '13.5px', color: '#666', marginBottom: 20 }}>
                High-performance computational infrastructure, specialized hardware testbenches, and industry standard software suites.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
                {data.labs && data.labs.map((lab, idx) => (
                  <div key={idx} style={{
                    background: '#F8F5EE',
                    borderRadius: 8,
                    padding: '18px 20px',
                    border: '1px solid #E4DDD0',
                    borderLeft: '4px solid #D49A17'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#6E0F0F' }}>{lab.name}</h4>
                      <span style={{ fontSize: '11px', background: '#D49A17', color: '#4A0808', fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>
                        {lab.capacity}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#444', lineHeight: 1.5 }}>
                      <strong>Key Equipment / Tools:</strong> {lab.equipment}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: FACULTY DIRECTORY */}
        {activeTab === 'faculty' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#6E0F0F' }}>
                    👨‍🏫 Faculty Members & Academic Staff
                  </h2>
                  <p style={{ fontSize: '13px', color: '#666' }}>Dedicated professors, researchers, and technical instructors</p>
                </div>
                <span style={{ background: '#F5E8CC', color: '#6E0F0F', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 20, border: '1px solid #D49A17' }}>
                  Total Faculty: {data.faculty?.length || 15}+
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                {data.faculty && data.faculty.map((f, idx) => (
                  <div key={idx} style={{
                    background: '#F8F5EE',
                    borderRadius: 8,
                    padding: '16px 18px',
                    border: '1px solid #E4DDD0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#6E0F0F' }}>{f.name}</h4>
                    <div style={{ fontSize: '12.5px', color: '#D49A17', fontWeight: 700 }}>{f.role}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Qualification: <strong>{f.qualification}</strong></div>
                    <div style={{ fontSize: '12px', color: '#444' }}>Specialization: <strong>{f.area}</strong></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 5: PLACEMENTS & MoUs */}
        {activeTab === 'placements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Placement Highlights */}
            {data.placements && (
              <section style={{
                background: '#FFFFFF',
                borderRadius: 10,
                padding: '26px 28px',
                border: '1px solid #D8D2C6',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16 }}>
                  💼 Department Placement Records
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 20 }}>
                  <div style={{ background: '#EAF8EE', padding: '16px', borderRadius: 8, border: '1px solid #B8E4C3' }}>
                    <span style={{ fontSize: '12px', color: '#1B6B38', fontWeight: 600 }}>Placement Rate</span>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#1B6B38' }}>{data.placements.percentage}</div>
                  </div>
                  <div style={{ background: '#FFF9ED', padding: '16px', borderRadius: 8, border: '1px solid #ECCFA0' }}>
                    <span style={{ fontSize: '12px', color: '#D49A17', fontWeight: 700 }}>Highest CTC</span>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#6E0F0F' }}>{data.placements.highest_package}</div>
                  </div>
                  <div style={{ background: '#F8F5EE', padding: '16px', borderRadius: 8, border: '1px solid #E4DDD0' }}>
                    <span style={{ fontSize: '12px', color: '#555' }}>Average CTC</span>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#333' }}>{data.placements.average_package}</div>
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#6E0F0F', marginBottom: 10 }}>Top Recruiting Corporate Partners:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {data.placements.recruiters.map((r, idx) => (
                    <span key={idx} style={{
                      background: '#F8F5EE',
                      border: '1px solid #D8D2C6',
                      color: '#2B2926',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      padding: '6px 14px',
                      borderRadius: 6
                    }}>
                      🏢 {r}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Industrial MoUs */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, borderBottom: '2px solid #D49A17', paddingBottom: 6 }}>
                🤝 Memorandums of Understanding (MoUs)
              </h2>
              {data.mous && data.mous.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#6E0F0F', color: '#FFFFFF' }}>
                        <th style={{ padding: '10px 14px' }}>S.No.</th>
                        <th style={{ padding: '10px 14px' }}>Name of Company / Institution</th>
                        <th style={{ padding: '10px 14px' }}>Date of MoU</th>
                        <th style={{ padding: '10px 14px' }}>Validity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.mous.map((mou) => (
                        <tr key={mou.sno} style={{ borderBottom: '1px solid #E4DDD0' }}>
                          <td style={{ padding: '10px 14px', color: '#666' }}>{mou.sno}</td>
                          <td style={{ padding: '10px 14px', color: '#222', fontWeight: 600 }}>{mou.company}</td>
                          <td style={{ padding: '10px 14px', color: '#666' }}>{mou.date}</td>
                          <td style={{ padding: '10px 14px', color: '#1B6B38', fontWeight: 700 }}>{mou.validity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '13px' }}>MoU details available in college brochure.</p>
              )}
            </section>
          </div>
        )}

        {/* TAB 6: STUDENT STATS & EVENTS */}
        {activeTab === 'students' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Student Strength */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, borderBottom: '2px solid #D49A17', paddingBottom: 6 }}>
                👥 Year-Wise Student Strength Details
              </h2>
              {data.official_student_stats && data.official_student_stats.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#6E0F0F', color: '#FFFFFF' }}>
                        <th style={{ padding: '10px 14px' }}>S.No.</th>
                        <th style={{ padding: '10px 14px' }}>Year / Class Batch</th>
                        <th style={{ padding: '10px 14px' }}>Total Students</th>
                        <th style={{ padding: '10px 14px' }}>Boys</th>
                        <th style={{ padding: '10px 14px' }}>Girls</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.official_student_stats.map((st) => (
                        <tr key={st.sno} style={{ borderBottom: '1px solid #E4DDD0' }}>
                          <td style={{ padding: '10px 14px', color: '#666' }}>{st.sno}</td>
                          <td style={{ padding: '10px 14px', color: '#222', fontWeight: 600 }}>{st.class_year}</td>
                          <td style={{ padding: '10px 14px', color: '#6E0F0F', fontWeight: 800 }}>{st.count}</td>
                          <td style={{ padding: '10px 14px', color: '#555' }}>{st.boys}</td>
                          <td style={{ padding: '10px 14px', color: '#555' }}>{st.girls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>

            {/* Professional Bodies & Memberships */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, borderBottom: '2px solid #6E0F0F', paddingBottom: 6 }}>
                🏆 Professional Societies & Student Chapters
              </h2>
              {data.memberships && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#6E0F0F', color: '#FFFFFF' }}>
                        <th style={{ padding: '10px 14px' }}>Est. Year</th>
                        <th style={{ padding: '10px 14px' }}>Professional Society Chapter</th>
                        <th style={{ padding: '10px 14px' }}>Active Members</th>
                        <th style={{ padding: '10px 14px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.memberships.map((m, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #E4DDD0' }}>
                          <td style={{ padding: '10px 14px', color: '#666' }}>{m.year}</td>
                          <td style={{ padding: '10px 14px', color: '#222', fontWeight: 600 }}>{m.society}</td>
                          <td style={{ padding: '10px 14px', color: '#6E0F0F', fontWeight: 700 }}>{m.students} Students</td>
                          <td style={{ padding: '10px 14px', color: '#1B6B38', fontWeight: 600 }}>{m.validity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Events & Technical Symposiums */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '26px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#6E0F0F', marginBottom: 14 }}>
                📰 Technical Symposiums & Hackathons
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                {data.events && data.events.map((ev, idx) => (
                  <div key={idx} style={{ background: '#F8F5EE', padding: 16, borderRadius: 8, border: '1px solid #E4DDD0', borderLeft: '4px solid #D49A17' }}>
                    <h4 style={{ fontSize: '14.5px', color: '#6E0F0F', fontWeight: 700 }}>{ev.title}</h4>
                    <p style={{ fontSize: '13px', color: '#555', marginTop: 4, lineHeight: 1.45 }}>{ev.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Live ERP Student Database Records (Authorized Staff) */}
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '24px 28px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#6E0F0F' }}>
                    ⚡ Real-Time ERP Student Records (PostgreSQL Database)
                  </h3>
                  <span style={{ fontSize: '12px', color: '#666' }}>Active live system counts connected to SIS</span>
                </div>

                {(isPrincipalOrAdmin || isAuthorizedHod) && (
                  <button
                    onClick={() => onNavigateToRoster && onNavigateToRoster(data.code)}
                    style={{
                      padding: '7px 16px', borderRadius: 6, background: '#6E0F0F', color: '#FFFFFF', fontWeight: 600, fontSize: '13px', border: '1px solid #4B0909', cursor: 'pointer'
                    }}
                  >
                    Access ERP Student Roster →
                  </button>
                )}
              </div>

              {liveErpStats ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginTop: 8 }}>
                  <div style={{ background: '#F8F5EE', padding: 14, borderRadius: 8, border: '1px solid #E4DDD0' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>1st Year ERP</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#222' }}>{liveErpStats.year_1_count || 0}</div>
                  </div>
                  <div style={{ background: '#F8F5EE', padding: 14, borderRadius: 8, border: '1px solid #E4DDD0' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>2nd Year ERP</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#222' }}>{liveErpStats.year_2_count || 0}</div>
                  </div>
                  <div style={{ background: '#F8F5EE', padding: 14, borderRadius: 8, border: '1px solid #E4DDD0' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>3rd Year ERP</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#222' }}>{liveErpStats.year_3_count || 0}</div>
                  </div>
                  <div style={{ background: '#F8F5EE', padding: 14, borderRadius: 8, border: '1px solid #E4DDD0' }}>
                    <span style={{ fontSize: '12px', color: '#666' }}>4th Year ERP</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#222' }}>{liveErpStats.year_4_count || 0}</div>
                  </div>
                  <div style={{ background: '#FFF9ED', padding: 14, borderRadius: 8, border: '1px solid #ECCFA0' }}>
                    <span style={{ fontSize: '12px', color: '#6E0F0F', fontWeight: 700 }}>Total ERP Students</span>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#6E0F0F' }}>{liveErpStats.total_students || 0}</div>
                  </div>
                </div>
              ) : (
                <p style={{ color: '#666', fontSize: '13px' }}>Loading live database stats...</p>
              )}
            </section>
          </div>
        )}

        {/* TAB 7: CONTACT & LOCATION */}
        {activeTab === 'contact' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <section style={{
              background: '#FFFFFF',
              borderRadius: 10,
              padding: '28px 30px',
              border: '1px solid #D8D2C6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h2 style={{ fontSize: '19px', fontWeight: 800, color: '#6E0F0F', marginBottom: 14 }}>
                📍 Department Office & Contact Information
              </h2>
              <div style={{ fontSize: '14px', color: '#333', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div><strong>Campus Address:</strong> {data.contact.address}</div>
                <div><strong>General Phone:</strong> {data.contact.phone}</div>
                <div><strong>Department Direct Email:</strong> <a href={`mailto:${data.contact.email}`} style={{ color: '#6E0F0F', fontWeight: 700 }}>{data.contact.email}</a></div>
                <div><strong>Official Web Portal:</strong> <a href={data.official_url} target="_blank" rel="noopener noreferrer" style={{ color: '#6E0F0F', fontWeight: 700 }}>{data.official_url} ↗</a></div>
              </div>

              <div style={{ marginTop: 24 }}>
                <a
                  href={data.official_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '12px 28px',
                    borderRadius: 6,
                    background: '#6E0F0F',
                    border: '1px solid #500A0A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '14px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 2px 8px rgba(110, 15, 15, 0.25)'
                  }}
                >
                  🌐 Visit Live College Portal for {data.code} Department →
                </a>
              </div>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
