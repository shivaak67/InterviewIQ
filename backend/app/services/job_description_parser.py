import re

from app.schemas.job_description import ParsedJobData

TECHNOLOGY_KEYWORDS = [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "FastAPI",
    "PostgreSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Java",
    "C++",
    "Go",
    "SQL",
    "MongoDB",
    "Redis",
    "Git",
    "REST",
    "GraphQL",
    "Vue",
    "Angular",
    "Tailwind",
    "Django",
    "Flask",
    "Spring",
    "Kotlin",
    "Swift",
    "Rust",
    "Azure",
    "GCP",
    "Linux",
    "CI/CD",
    "Terraform",
    "Kafka",
    "Spark",
    "TensorFlow",
    "PyTorch",
]

SKILL_KEYWORDS = [
    "communication",
    "leadership",
    "problem solving",
    "teamwork",
    "collaboration",
    "agile",
    "scrum",
    "debugging",
    "testing",
    "system design",
    "data structures",
    "algorithms",
    "project management",
    "mentoring",
]

STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "from",
    "your",
    "will",
    "have",
    "are",
    "our",
    "you",
    "able",
    "using",
    "work",
    "role",
    "team",
    "experience",
    "skills",
    "required",
    "preferred",
    "including",
    "about",
    "their",
    "such",
    "into",
    "other",
    "than",
    "when",
    "what",
    "where",
    "which",
    "while",
    "would",
    "should",
    "could",
    "been",
    "being",
    "also",
    "more",
    "most",
    "some",
    "than",
    "them",
    "they",
    "these",
    "those",
}


def parse_job_description(raw_text: str) -> ParsedJobData:
    text_lower = raw_text.lower()

    technologies = [
        tech for tech in TECHNOLOGY_KEYWORDS if tech.lower() in text_lower
    ]

    skills = [skill.title() for skill in SKILL_KEYWORDS if skill in text_lower]

    responsibilities: list[str] = []
    for line in raw_text.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        if re.match(r"^[-•*]\s+", stripped) or re.match(r"^\d+[.)]\s+", stripped):
            cleaned = re.sub(r"^[-•*]\s+", "", stripped)
            cleaned = re.sub(r"^\d+[.)]\s+", "", cleaned).strip()
            if len(cleaned) >= 10:
                responsibilities.append(cleaned)

    words = re.findall(r"[A-Za-z][A-Za-z0-9+#./-]{2,}", raw_text)
    keyword_candidates: list[str] = []
    seen: set[str] = set()
    for word in words:
        normalized = word.lower()
        if normalized in STOPWORDS or normalized in seen:
            continue
        if len(normalized) < 4:
            continue
        seen.add(normalized)
        keyword_candidates.append(word if word.isupper() else word.capitalize())

    tech_lower = {t.lower() for t in technologies}
    skill_lower = {s.lower() for s in skills}
    keywords = [
        word
        for word in keyword_candidates
        if word.lower() not in tech_lower and word.lower() not in skill_lower
    ][:20]

    return ParsedJobData(
        skills=skills,
        technologies=technologies,
        responsibilities=responsibilities[:15],
        keywords=keywords,
    )
