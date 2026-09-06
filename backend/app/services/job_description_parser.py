import re
from app.schemas.job_description import ParsedJobData

TECHNOLOGIES = {
    name: [name] for name in ['Python', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js',
    'FastAPI', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Java', 'C++', 'C#', 'SQL', 'MongoDB',
    'Redis', 'Git', 'REST', 'GraphQL', 'Vue', 'Angular', 'Tailwind', 'Django', 'Flask', 'Spring',
    'Kotlin', 'Swift', 'Rust', 'Azure', 'GCP', 'Linux', 'CI/CD', 'Terraform', 'Kafka', 'Spark',
    'TensorFlow', 'PyTorch', 'HTML', 'CSS', 'Playwright', 'Jest', 'Vitest', 'Cypress']
}
TECHNOLOGIES.update({'Go': ['Golang', 'Go'], 'Node.js': ['Node.js', 'NodeJS'],
                     'PostgreSQL': ['PostgreSQL', 'Postgres'], 'Next.js': ['Next.js', 'NextJS']})
SKILLS = ['communication', 'leadership', 'problem solving', 'teamwork', 'collaboration',
          'agile', 'scrum', 'debugging', 'testing', 'system design', 'data structures',
          'algorithms', 'project management', 'mentoring', 'accessibility', 'performance']


def _contains(text: str, term: str) -> bool:
    # Token boundaries also work for punctuation-heavy names such as C++ and Node.js.
    return bool(re.search(r'(?<![\w])' + re.escape(term) + r'(?![\w+#])', text, re.I))


def parse_job_description(raw_text: str) -> ParsedJobData:
    technologies = [name for name, aliases in TECHNOLOGIES.items()
                    if any(_contains(raw_text, alias) for alias in aliases)]
    # Avoid matching the everyday verb "go" unless language context supports it.
    if 'Go' in technologies and not re.search(r'\bGolang\b|\bGo\b(?=\s*(?:[,/]|and\b|development|programming|engineer))', raw_text):
        technologies.remove('Go')
    skills = [skill.title() for skill in SKILLS if _contains(raw_text, skill)]
    responsibilities, required, preferred = [], [], []
    section = 'other'
    for part in re.split(r'\n|(?<=[.!?])\s+', raw_text):
        cleaned = re.sub(r'^\s*(?:[-•*]|\d+[.)])\s*', '', part).strip()
        if not cleaned:
            continue
        if re.search(r'^(required|requirements|qualifications|must have|what we.re looking for)\b', cleaned, re.I):
            section = 'required'
        elif re.search(r'^(preferred|bonus|nice to have)\b', cleaned, re.I):
            section = 'preferred'
        elif re.search(r'^(responsibilities|what you.ll do|about|benefits)\b', cleaned, re.I):
            section = 'other'
        found = [tech for tech in technologies if any(_contains(cleaned, alias) for alias in TECHNOLOGIES[tech])]
        if section == 'required':
            required.extend(found)
        elif section == 'preferred':
            preferred.extend(found)
        if re.match(r'^(build|develop|design|write|maintain|implement|collaborate|debug|test|own|lead|integrate|deliver|monitor)\b', cleaned, re.I):
            responsibilities.append(cleaned)
    return ParsedJobData(technologies=technologies, skills=skills, keywords=[],
                         required_skills=list(dict.fromkeys(required)),
                         preferred_skills=list(dict.fromkeys(preferred)),
                         responsibilities=responsibilities[:15])
