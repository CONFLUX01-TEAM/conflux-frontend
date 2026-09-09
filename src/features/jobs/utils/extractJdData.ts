/**
 * Known skill dictionaries for intelligent extraction from raw JD text.
 */
const COMMON_SKILLS = [
  // Languages & Core Frameworks
  'Java',
  'Spring Boot',
  'Python',
  'Django',
  'Flask',
  'FastAPI',
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Vue.js',
  'Angular',
  'Node.js',
  'Express.js',
  'NestJS',
  'C#',
  '.NET',
  'Go',
  'Golang',
  'Rust',
  'PHP',
  'Laravel',
  'Ruby',
  'Ruby on Rails',
  'Kotlin',
  'Swift',
  // Databases & Storage
  'SQL',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Elasticsearch',
  'DynamoDB',
  'Cassandra',
  'Oracle',
  'JPA/Hibernate',
  // Messaging, Architecture & APIs
  'REST APIs',
  'GraphQL',
  'gRPC',
  'Microservices',
  'Kafka',
  'RabbitMQ',
  'Event-Driven Architecture',
  // DevOps, Cloud & Tools
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Heroku',
  'CI/CD',
  'Terraform',
  'Git',
  'Maven/Gradle',
  'JUnit',
  'Mockito',
  'Thymeleaf',
  // Design & Product
  'Figma',
  'UI/UX',
  'Wireframing',
  'Prototyping',
  'User Research',
  'Design Systems',
  // Data & AI
  'Machine Learning',
  'PyTorch',
  'TensorFlow',
  'Pandas',
  'NumPy',
  'Data Pipelines',
  'Tableau',
  'Power BI',
]

export interface ExtractedJdData {
  roleTitle: string
  department: string
  seniorityLevel: string
  experienceLevel: string
  location?: string
  workModel?: 'Remote' | 'Hybrid' | 'On-site'
  employmentType?: string
  minSalary?: number | null
  maxSalary?: number | null
  requiredSkills: string[]
  preferredSkills: string[]
  responsibilities: string[]
  salaryCompensation?: string
  roleSummary: string
}

/**
 * Intelligently analyzes raw text extracted from a job description document
 * and structures it into appropriate form fields.
 */
export function extractJdData(rawText: string, fallbackFilename = ''): ExtractedJdData {
  const cleanText = rawText.replace(/\r\n/g, '\n')
  const lines = cleanText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  // ── 1. Role Title Extraction ──────────────────────────────────────────
  let roleTitle = ''

  // Check for explicit "Backend Engineer", "Senior Software Engineer", etc.
  const titlePatterns = [
    /(?:Job Title|Role|Position)\s*[:—–-]\s*([^\n\r]+)/i,
    /(?:looking for a|seeking an?)\s+([A-Z][a-zA-Z\s/]+(?:Engineer|Developer|Designer|Manager|Analyst|Lead|Architect|Specialist))/i,
    /\b((?:Senior|Lead|Principal|Junior|Mid-Level)?\s*(?:Backend|Frontend|Full[\s-]?stack|Software|DevOps|Data|Mobile|Cloud|Product|Security|QA)\s+(?:Engineer|Developer|Designer|Manager|Analyst|Architect|Specialist))\b/i,
  ]

  for (const pattern of titlePatterns) {
    const match = cleanText.match(pattern)
    if (match && match[1]) {
      roleTitle = match[1].trim()
      // Clean trailing punctuation or extra words
      roleTitle = roleTitle.replace(/[|—–].*$/, '').trim()
      break
    }
  }

  // Fallback: check top lines for standalone title keywords
  if (!roleTitle) {
    for (const line of lines.slice(0, 10)) {
      if (
        /^(?:Senior\s+|Lead\s+|Principal\s+|Junior\s+)?(?:Backend|Frontend|Full[\s-]?stack|Software|Product|Data|Cloud|DevOps|Mobile)\s+(?:Engineer|Developer|Designer|Manager|Analyst)$/i.test(
          line,
        )
      ) {
        roleTitle = line
        break
      }
    }
  }

  // Fallback 2: Check header "Job Description — <Title> |"
  if (!roleTitle) {
    const headerMatch = cleanText.match(/Job Description\s*[—–-]\s*([^|\n\r]+)/i)
    if (headerMatch && headerMatch[1]) {
      roleTitle = headerMatch[1].trim()
    }
  }

  // Ultimate fallback to filename
  if (!roleTitle && fallbackFilename) {
    roleTitle = fallbackFilename
      .replace(/\.[^/.]+$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\bjd\b|\bjob\b|\bdescription\b/gi, '')
      .trim()
  }

  // ── 2. Department Extraction ──────────────────────────────────────────
  let department = 'Software Engineering'
  const lowerText = cleanText.toLowerCase()
  const lowerTitle = roleTitle.toLowerCase()

  if (
    lowerTitle.includes('developer') ||
    lowerTitle.includes('engineer') ||
    lowerTitle.includes('fullstack') ||
    lowerTitle.includes('frontend') ||
    lowerTitle.includes('backend') ||
    lowerTitle.includes('devops')
  ) {
    department = 'Software Engineering'
  } else if (
    lowerTitle.includes('designer') ||
    lowerTitle.includes('product design') ||
    lowerTitle.includes('ui/ux') ||
    lowerText.includes('product designer') ||
    lowerText.includes('ui/ux designer')
  ) {
    department = 'Product Design'
  } else if (
    lowerTitle.includes('product manager') ||
    lowerTitle.includes('product management') ||
    lowerText.includes('product manager')
  ) {
    department = 'Product Management'
  } else if (
    lowerTitle.includes('data') ||
    lowerTitle.includes('analyst') ||
    lowerText.includes('data scientist') ||
    lowerText.includes('data analyst')
  ) {
    department = 'Data & Analytics'
  } else if (lowerTitle.includes('marketing') || lowerText.includes('marketing manager')) {
    department = 'Marketing'
  } else if (lowerTitle.includes('sales') || lowerText.includes('sales executive')) {
    department = 'Sales & Business Dev'
  }

  // ── 3. Seniority Level Extraction ─────────────────────────────────────
  let seniorityLevel = 'Mid-Level Developer'
  if (
    /\b(?:principal|staff)\b/i.test(roleTitle) ||
    /\b(?:principal|staff)\b/i.test(cleanText.slice(0, 500))
  ) {
    seniorityLevel = 'Principal / Staff'
  } else if (
    /\b(?:lead|head|architect)\b/i.test(roleTitle) ||
    /\b(?:lead engineer|team lead)\b/i.test(cleanText.slice(0, 500))
  ) {
    seniorityLevel = 'Lead Engineer'
  } else if (
    /\b(?:senior|sr\.?)\b/i.test(roleTitle) ||
    /\b(?:senior engineer|senior developer)\b/i.test(cleanText.slice(0, 500))
  ) {
    seniorityLevel = 'Senior Developer'
  } else if (
    /\b(?:junior|jr\.?|entry|intern)\b/i.test(roleTitle) ||
    /\b(?:junior|intern)\b/i.test(cleanText.slice(0, 500))
  ) {
    seniorityLevel = 'Junior Developer'
  }

  // ── 4. Experience Level Extraction ────────────────────────────────────
  let experienceLevel = '1-3 Years'
  const expMatch = cleanText.match(/(?:minimum|at least|\b)(\d+)(?:\+|-(\d+))?\s*(?:years?|yrs?)/i)
  if (expMatch) {
    const minYears = parseInt(expMatch[1], 10)
    if (minYears <= 1) {
      experienceLevel = '0-1 Years'
    } else if (minYears <= 3) {
      experienceLevel = '1-3 Years'
    } else if (minYears <= 5) {
      experienceLevel = '5-8 Years'
    } else if (minYears <= 8) {
      experienceLevel = '5-8 Years'
    } else {
      experienceLevel = '8+ Years'
    }
  }

  // ── 5. Responsibilities Extraction ────────────────────────────────────
  const responsibilities: string[] = []
  const respSectionMatch = cleanText.match(
    /(?:Key\s+responsibilities|Responsibilities|What\s+you(?:'ll|\s+will)\s+do|Duties)[\s\S]*?(?:Requirements|Required\s+experience|Technical\s+skills|Qualifications|Benefits|$)/i,
  )
  if (respSectionMatch) {
    const respLines = respSectionMatch[0]
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^[-•*–—]|\d+\./.test(l) || (l.length > 25 && l.length < 200))
    for (const r of respLines) {
      const cleanR = r.replace(/^[-•*–—\d.]+\s*/, '').trim()
      if (cleanR && !cleanR.toLowerCase().includes('responsibilities')) {
        responsibilities.push(cleanR)
      }
    }
  }

  // ── 6. Salary / Compensation Extraction ───────────────────────────────
  let salaryCompensation: string | undefined = undefined
  const salaryMatch =
    cleanText.match(/(?:Remuneration|Salary|Compensation|Pay\s+range)\s*[:—–-]\s*([^\n\r]+)/i) ||
    cleanText.match(
      /(?:[$€£₦]\s*\d+[\d,.]*(?:\s*[-–—to]+\s*[$€£₦]?\s*\d+[\d,.]*)?(?:\s*(?:k|per\s+(?:year|annum|month|hr|hour)|\/yr|\/mo))?)/i,
    )
  if (salaryMatch && salaryMatch[1]) {
    salaryCompensation = salaryMatch[1].trim()
  }

  // ── 7. Skills Extraction (Core vs Preferred) ─────────────────────────
  const requiredSectionMatch = cleanText.match(
    /(?:Required experience|Technical skills|Requirements|Must have|Key responsibilities)[\s\S]*?(?:Fintech and regulatory|Ideal candidates|Nice to have|Bonus|Preferred|How to apply|$)/i,
  )
  const preferredSectionMatch = cleanText.match(
    /(?:Fintech and regulatory|Ideal candidates|Nice to have|Bonus|Preferred|Good to have)[\s\S]*?(?:How to apply|Benefits|About|$)/i,
  )

  const reqText = requiredSectionMatch ? requiredSectionMatch[0] : cleanText
  const prefText = preferredSectionMatch ? preferredSectionMatch[0] : cleanText

  const matchedSkills = COMMON_SKILLS.filter((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return regex.test(cleanText)
  })

  const reqSkills: string[] = []
  const prefSkills: string[] = []

  for (const skill of matchedSkills) {
    const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    const inPreferredSection = preferredSectionMatch && skillRegex.test(prefText)
    const inRequiredSection = requiredSectionMatch && skillRegex.test(reqText)

    if (inPreferredSection && !inRequiredSection) {
      prefSkills.push(skill)
    } else {
      reqSkills.push(skill)
    }
  }

  // ── 8. Role Summary Extraction ─────────────────────────────────────────
  // Look for About section + The Role section
  const aboutMatch = cleanText.match(
    /(?:About\s+[^\n\r]+|Company\s+Overview|Who\s+We\s+Are)\s*[\n\r]+([\s\S]*?)(?=(?:The\s+role|Role\s+Overview|Key\s+responsibilities|Responsibilities|Requirements|Required\s+experience|Technical\s+skills|\n{3,}|$))/i,
  )
  const roleDescMatch = cleanText.match(
    /(?:The\s+role|Role\s+Overview|Position\s+Summary|Job\s+Summary)\s*[\n\r]+([\s\S]*?)(?=(?:Key\s+responsibilities|Responsibilities|Requirements|Required\s+experience|Technical\s+skills|Fintech\s+and\s+regulatory|\n{3,}|$))/i,
  )

  const summaryParts: string[] = []
  if (aboutMatch && aboutMatch[1]) {
    const cleanAbout = aboutMatch[1]
      .replace(/Job Description\s*[—–-]\s*[^\n|]+\|[^\n|]+\|?\s*Page \d+/gi, '')
      .replace(/Page \d+/gi, '')
      .replace(/\n+/g, ' ')
      .trim()
    if (cleanAbout) summaryParts.push(cleanAbout)
  }
  if (roleDescMatch && roleDescMatch[1]) {
    const cleanRole = roleDescMatch[1]
      .replace(/Job Description\s*[—–-]\s*[^\n|]+\|[^\n|]+\|?\s*Page \d+/gi, '')
      .replace(/Page \d+/gi, '')
      .replace(/\n+/g, ' ')
      .trim()
    if (cleanRole) summaryParts.push(cleanRole)
  }
  const roleSummary = summaryParts.join('\n\n')

  // ── 9. Location & Work Model Extraction ──────────────────────────────
  let location: string | undefined = undefined
  let workModel: 'Remote' | 'Hybrid' | 'On-site' = 'Remote'
  const locationMatch = cleanText.match(/(?:Location|Workplace)\s*[:—–-]\s*([^\n\r]+)/i)
  if (locationMatch && locationMatch[1]) {
    location = locationMatch[1].trim()
    const locLower = location.toLowerCase()
    if (locLower.includes('hybrid')) {
      workModel = 'Hybrid'
      location = location.replace(/[—–-]\s*Hybrid.*$/i, '').trim()
    } else if (
      locLower.includes('on-site') ||
      locLower.includes('onsite') ||
      locLower.includes('in-office')
    ) {
      workModel = 'On-site'
      location = location.replace(/[—–-]\s*(?:on-site|onsite).*$/i, '').trim()
    } else if (locLower.includes('remote')) {
      workModel = 'Remote'
      location = location.replace(/[—–-]\s*Remote.*$/i, '').trim()
    }
  } else {
    if (/\bhybrid\b/i.test(cleanText)) workModel = 'Hybrid'
    else if (/\bon-site\b|\bonsite\b|\bin-office\b/i.test(cleanText)) workModel = 'On-site'
  }

  // ── 10. Employment Type Extraction ────────────────────────────────────
  let employmentType: string = 'Full-time'
  const empMatch = cleanText.match(
    /(?:Engagement type|Employment type|Job type|Type)\s*[:—–-]\s*([^\n\r]+)/i,
  )
  if (empMatch && empMatch[1]) {
    const rawEmp = empMatch[1].toLowerCase()
    if (rawEmp.includes('contract')) employmentType = 'Contract'
    else if (rawEmp.includes('part')) employmentType = 'Part-time'
    else if (rawEmp.includes('intern')) employmentType = 'Internship'
    else employmentType = 'Full-time'
  }

  // ── 11. Min/Max Salary Numbers ─────────────────────────────────────────
  let minSalary: number | null = null
  let maxSalary: number | null = null
  if (salaryCompensation) {
    const digits = salaryCompensation.match(/\d[\d,.]*/g)
    if (digits && digits.length >= 2) {
      const num1 = parseInt(digits[0].replace(/,/g, ''), 10)
      const num2 = parseInt(digits[1].replace(/,/g, ''), 10)
      if (!isNaN(num1) && !isNaN(num2)) {
        minSalary = Math.min(num1, num2)
        maxSalary = Math.max(num1, num2)
      }
    } else if (digits && digits.length === 1) {
      const num = parseInt(digits[0].replace(/,/g, ''), 10)
      if (!isNaN(num)) {
        minSalary = num
        maxSalary = null
      }
    }
  }

  return {
    roleTitle:
      roleTitle ||
      fallbackFilename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .trim(),
    department,
    seniorityLevel,
    experienceLevel,
    location: location || 'Lagos, Nigeria',
    workModel,
    employmentType,
    minSalary,
    maxSalary,
    responsibilities: responsibilities.slice(0, 10),
    salaryCompensation,
    requiredSkills: Array.from(new Set(reqSkills)),
    preferredSkills: Array.from(new Set(prefSkills)),
    roleSummary: roleSummary.trim(),
  }
}
