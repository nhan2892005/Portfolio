import { meta } from "../assets/images";
import {
    ann,
    contact,
    css,
    cv,
    express,
    git,
    github,
    html,
    javascript,
    linkedin,
    mongodb,
    mui,
    nextjs,
    nodejs,
    tiki,
    react,
    redux,
    enjoy,
    summiz,
    tailwindcss,
    threads,
    typescript,
    c,
    cplusplus,
    python,
    linux,
    Windows,
    Ubuntu,
    Hadoop,
    Spark,
    Kafka,
    mssqlserver,
    bigquery,
    docker,
    tableau,
    powerbi,
    gcp,
    aws,
    azure,
    bigdata,
    fablab,
    paper,
    matrix,
} from "../assets/icons";
import { a } from "@react-spring/three";

export const pro_lang = [
    // C
    {
        imageUrl: c,
        name: "C",
        type: "Programming Language",
    },
    // C++
    {
        imageUrl: cplusplus,
        name: "C++",
        type: "Programming Language",
    },
    // Python
    {
        imageUrl: python,
        name: "Python",
        type: "Programming Language",
    },
]

export const frontendsk = [
    {
        imageUrl: css,
        name: "CSS",
        type: "Frontend",
    },
    {
        imageUrl: html,
        name: "HTML",
        type: "Frontend",
    },
    {
        imageUrl: javascript,
        name: "JavaScript",
        type: "Frontend",
    },
    
    {
        imageUrl: mui,
        name: "Material-UI",
        type: "Frontend",
    },
    {
        imageUrl: nextjs,
        name: "Next.js",
        type: "Frontend",
    },
    
    {
        imageUrl: tailwindcss,
        name: "Tailwind CSS",
        type: "Frontend",
    },
    {
        imageUrl: typescript,
        name: "TypeScript",
        type: "Frontend",
    },
    {
        imageUrl: react,
        name: "React",
        type: "Frontend",
    },
]

export const backendsk = [
    {
        imageUrl: express,
        name: "Express",
        type: "Backend",
    },
    {
        imageUrl: nodejs,
        name: "Node.js",
        type: "Backend",
    },
    {
        imageUrl: redux,
        name: "Redux",
        type: "State Management",
    },
];

export const database = [
    // mongo
    {
        imageUrl: mongodb,
        name: "MongoDB",
        type: "Database",
    },
    // ms sql
    {
        imageUrl: mssqlserver,
        name: "MS SQL",
        type: "Database",
    },
    // bigquery
    {
        imageUrl: bigquery,
        name: "BigQuery",
        type: "Database",
    },
]

export const svc_cicd = [
    // git
    {
        imageUrl: git,
        name: "Git",
        type: "Version Control",
    },
    // github
    {
        imageUrl: github,
        name: "GitHub",
        type: "Version Control",
    },
    // docker
    {
        imageUrl: docker,
        name: "Docker",
        type: "Containerization",
    },
]

export const os = [
    // linux
    {
        imageUrl: linux,
        name: "Linux",
        type: "Operating System",
    },
    // windows
    {
        imageUrl: Windows,
        name: "Windows",
        type: "Operating System",
    },
    // ubuntu
    {
        imageUrl: Ubuntu,
        name: "Ubuntu",
        type: "Operating System",
    },
]

export const big_data = [
    // hadoop
    {
        imageUrl: Hadoop,
        name: "Hadoop",
        type: "Big Data",
    },
    // spark
    {
        imageUrl: Spark,
        name: "Spark",
        type: "Big Data",
    },
    // kafka
    {
        imageUrl: Kafka,
        name: "Kafka",
        type: "Big Data",
    },
]

export const data_visualize = [
    // power bi
    {
        imageUrl: powerbi,
        name: "Power BI",
        type: "Data Visualization",
    },
    // tableau
    {
        imageUrl: tableau,
        name: "Tableau",
        type: "Data Visualization",
    },
]

export const cloud = [
    // aws
    {
        imageUrl: aws,
        name: "AWS",
        type: "Cloud",
    },
    // gcp
    {
        imageUrl: gcp,
        name: "GCP",
        type: "Cloud",
    },
    // azure
    {
        imageUrl: azure,
        name: "Azure",
        type: "Cloud",
    },
];

export const research_experiences = [
    {
        title: "Member",
        company_name: "Big Data Club",
        icon: bigdata,  // Replace with the appropriate icon
        iconBg: "#accbe1",
        date: "Sep 2024 - Present",
        points: [
            "Research on the application of Reinforcement Learning in Resource Management, particularly in the Scheduling Problem within HPC Systems.",
            "Leveraged Kafka and Spark for data stream processing, real-time analytics and IOT",
        ],
    },
    {
        title: "Member",
        company_name: "Fablab Innovation",
        icon: fablab,  // Replace with the appropriate icon
        iconBg: "#fbc3bc",
        date: "Dec 2023 - Aug 2024",
        points: [
            "Researched AI applications in digital factory transformation, industrial modernization, and manufacturing.",
            "Focused on computer vision technologies for automated factory processes and design of industrial ICs.",
            "Utilized Python for AI model development and applied WinForms for UI development in .NET.",
        ],
    },
    {
        title: "Publications",
        company_name: "",
        icon: paper,  // Replace with the appropriate icon
        iconBg: "#fbc3bc",
        date: "",
        points: [
        ],
    },
];

export const experiences = [
    
];

export const socialLinks = [
    {
        name: 'Contact',
        iconUrl: contact,
        link: '/contact',
    },
    {
        name: 'GitHub',
        iconUrl: github,
        link: 'https://github.com/nhan2892005',
    },
    {
        name: 'LinkedIn',
        iconUrl: linkedin,
        link: 'https://www.linkedin.com/in/phuc-nhan-nguyen/',
    },
    {
        name: 'Facebook',
        iconUrl: meta,
        link: 'https://www.facebook.com/phucnhancshcmut/',
    },
];

export const projects = [
    {
        iconUrl: matrix,  
        theme: 'btn-back-blue',
        name: 'Matrix Calculator',
        description: 'A tool that supports various operations on 2D matrices, designed using C/C++. It implements key concepts from OOP, Linear Algebra, and Algorithms.',
        link: 'https://github.com/nhan2892005/OOP_and_LinearAlgebra-MatrixOperator_in_C',
        livesite: '',
    },
    {
        iconUrl: ann,  
        theme: 'btn-back-red',
        name: 'Library for Multilayer Perceptron',
        description: 'A deep learning library designed for ANN models, built with C/C++. It supports multidimensional arrays and OOP principles. Source code available in Dec 2024.',
        link: 'https://github.com/nhan2892005/DSA_and_MLP',
        livesite: '',
    },
    {
        iconUrl: cv,  
        theme: 'btn-back-green',
        name: 'AI-powered SaaS Platform',
        description: 'Developed an AI-powered image processing SaaS platform. Integrated features such as Image Restoration, Recoloring, Generative Fill, and secure payment integration.',
        link: 'https://github.com/nhan2892005/FullStack-AI_SaaS_Platform',
        livesite: 'https://aiyourimage.vercel.app/',
    },
    {
        iconUrl: tiki, 
        theme: 'btn-back-yellow',
        name: 'E-commerce Review Analysis and Data Warehouse',
        description: 'Developed a data warehouse and NLP-based review summarization system for e-commerce. Designed ETL pipelines and deployed NLP models for real-time product review analysis.',
        link: 'https://github.com/nhan2892005/AnalystReviewProduct',
        livesite: 'https://tikiassistant.netlify.app/',
    },
    {
        iconUrl: enjoy, 
        theme: 'btn-back-pink',
        name: 'Social Web App',
        description: 'A social platform for sharing memories, with features such as Google OAuth, posting, commenting, and searching by tags. Includes pagination and responsive UI.',
        link: 'https://enjoy-moments.netlify.app/',
        livesite: 'https://enjoy-moments.netlify.app/',
    }
];
