---
name: content-analysis
description: Marketing content analysis orchestrator with domain expertise in brand voice, messaging, SEO, readability, and audience engagement. Analyzes content quality and provides strategic recommendations.
type: skill
tier: 2
model: sonnet
version: 1.0.0
allowed-tools: []
delegates-to: [read-file, extract-text, analyze-sentiment, calculate-readability, check-seo, detect-tone]
---

# Content Analysis Skill (Tier 2 Orchestrator)

**Type**: Tier 2 - Orchestrator with Domain Expertise
**Role**: Marketing and content strategy specialist that orchestrates content analysis
**Methodology**: Tactical 4-D

---

## Purpose

Analyzes marketing content for brand consistency, messaging effectiveness, SEO optimization, readability, and audience engagement. Provides strategic recommendations to improve content performance.

**Key Principle**: This skill brings marketing and content strategy domain expertise to orchestrate micro-skills for comprehensive content analysis.

---

## Integration with Maestro

### Receives from Maestro (Strategic Direction)

**Product**: What to analyze
```typescript
{
  goal: "Analyze blog posts for brand voice consistency",
  scope: "content/blog/*.md",
  focus: ["brand-voice", "tone", "messaging"]
}
```

**Process**: How to approach it
```typescript
{
  methodology: "Content audit with brand guidelines comparison",
  constraints: ["Compare against brand_guidelines.md", "Focus on recent posts"],
  standards: ["Brand voice guide", "SEO best practices"]
}
```

**Performance**: What defines success
```typescript
{
  deliverable: "Content audit report with consistency scores",
  criteria: ["All posts evaluated", "Recommendations actionable"],
  timeline: "Complete analysis within 5 minutes"
}
```

### Returns to Maestro

```typescript
{
  success: true,
  analysis: {
    summary: "Analyzed 12 blog posts. 8 align with brand, 4 need revision.",
    brand_consistency_score: 7.8,
    findings: [...],
    recommendations: [...]
  },
  metadata: {
    posts_analyzed: 12,
    total_word_count: 8450,
    duration_ms: 8200
  }
}
```

---

## Tactical 4-D Implementation

### 1. DELEGATION (Tactical) - Micro-Skill Selection

Based on analysis scope, select and sequence micro-skills:

**Brand Voice Analysis Chain**:
```typescript
1. read-file (parallel) → Load all content files
2. extract-text → Extract clean text from markup
3. detect-tone → Analyze tone (professional, casual, technical, friendly)
4. analyze-sentiment → Measure sentiment (positive, neutral, negative)
5. compare-to-guidelines → Check against brand guidelines
6. format-output → Generate brand consistency report
```

**SEO Optimization Chain**:
```typescript
1. read-file (parallel) → Load content files
2. extract-text → Get clean content
3. check-seo → Analyze keywords, meta descriptions, headings
4. calculate-readability → Measure readability scores
5. detect-patterns → Find SEO anti-patterns
6. format-output → Generate SEO audit report
```

**Audience Engagement Chain**:
```typescript
1. read-file (parallel) → Load content
2. extract-text → Clean text
3. analyze-sentiment → Emotional resonance
4. calculate-readability → Accessibility scores
5. detect-hooks → Identify compelling elements (questions, stories, stats)
6. format-output → Engagement analysis report
```

### 2. DESCRIPTION (Tactical) - Micro-Skill Direction

Provide clear parameters to each micro-skill:

**detect-tone micro-skill**:
```typescript
{
  operation: "detect-tone",
  parameters: {
    text: "...content text...",
    categories: ["professional", "casual", "technical", "friendly", "authoritative"],
    return_confidence: true
  },
  purpose: "Identify content tone for brand consistency check",
  expected_output: {
    type: "object",
    tone: "string",
    confidence: "number",
    indicators: ["array of phrases that indicate tone"]
  }
}
```

**check-seo micro-skill**:
```typescript
{
  operation: "check-seo",
  parameters: {
    content: "...full content...",
    target_keyword: "content marketing strategy",
    check_items: [
      "keyword-density",
      "meta-description",
      "heading-structure",
      "internal-links",
      "readability"
    ]
  },
  purpose: "Evaluate SEO optimization",
  expected_output: {
    type: "object",
    seo_score: "number (0-100)",
    issues: ["array"],
    recommendations: ["array"]
  }
}
```

**calculate-readability micro-skill**:
```typescript
{
  operation: "calculate-readability",
  parameters: {
    text: "...content text...",
    metrics: ["flesch-reading-ease", "flesch-kincaid-grade", "gunning-fog"],
    target_audience: "general" // or "technical", "academic"
  },
  purpose: "Assess content accessibility",
  expected_output: {
    type: "object",
    flesch_reading_ease: "number",
    grade_level: "number",
    accessibility: "easy|moderate|difficult"
  }
}
```

### 3. DISCERNMENT (Tactical) - Output Evaluation

Evaluate each micro-skill output before proceeding:

**detect-tone output**:
```typescript
✓ Tone identified with confidence > 0.6
✓ Indicators provided as evidence
✓ Tone category is valid
✗ If confidence < 0.6 → Mark as "unclear tone", flag for manual review
```

**check-seo output**:
```typescript
✓ SEO score is between 0-100
✓ All requested check items evaluated
✓ Issues have specific locations (line numbers, headings)
✓ Recommendations are actionable
✗ If critical SEO issues → Prioritize in final report
```

**calculate-readability output**:
```typescript
✓ Metrics computed successfully
✓ Grade level reasonable (0-20 range)
✓ Accessibility assessment matches scores
✗ If readability too high/low for target → Flag as concern
```

### 4. DILIGENCE (Tactical) - Error Recovery & Re-Planning

**5-Level Error Recovery System**:

**Level 1: Retry with Backoff**
- File temporarily unavailable → Retry read-file
- API rate limit (if using external service) → Wait and retry
- Temporary parsing error → Retry with alternative parser

**Level 2: Parameter Adjustment**
- Content too long (>50k words) → Analyze in chunks
- Language detection fails → Assume English, proceed
- No target keyword specified → Extract primary topic from content

**Level 3: Alternative Approach**
- Advanced sentiment analysis fails → Use basic keyword matching
- SEO tool unavailable → Manual pattern detection
- Tone detection unclear → Analyze word choice and sentence structure

**Level 4: Partial Success**
- 10/12 posts analyzed, 2 parsing errors → Return partial results
- Brand guidelines file missing → Analyze content standalone
- SEO check incomplete → Return available metrics

**Level 5: Escalate to Maestro**
- All content files inaccessible
- Content language unsupported
- Brand guidelines contradict analysis requirements

**Error Recovery Examples**:

```typescript
// Level 1: Retry
if (error.code === "RATE_LIMIT") {
  await wait(1000);
  await retry(check_seo, { attempts: 2 });
}

// Level 2: Adjust Parameters
if (content.word_count > 50000) {
  // Analyze in 10k word chunks
  const chunks = split_content(content, 10000);
  const results = await Promise.all(
    chunks.map(chunk => analyze_chunk(chunk))
  );
  return aggregate_results(results);
}

// Level 3: Alternative Approach
try {
  const tone = await detect_tone_advanced(text);
} catch (error) {
  // Fall back to keyword-based tone detection
  const tone = detect_tone_keywords(text);
}

// Level 4: Partial Success
const results = {
  success: true,
  analyzed_count: 10,
  failed_count: 2,
  disclaimer: "2 posts could not be parsed (corrupted markup)",
  findings: [...findings_from_10_posts]
};

// Level 5: Escalate
if (unsupported_language) {
  return {
    success: false,
    escalate: true,
    reason: "Content language (Japanese) not supported by analysis tools",
    suggestion: "Specify English content or use language-specific tools"
  };
}
```

---

## Domain Expertise Application

### Brand Voice Consistency

**Tone Analysis**:
- Professional vs. Casual language
- Technical jargon appropriateness
- Emotional resonance (warm, authoritative, enthusiastic)
- Consistency across content pieces

**Brand Guideline Compliance**:
- Terminology usage (approved terms vs. avoid list)
- Voice characteristics (active voice, second person)
- Style preferences (oxford comma, title case)

**Example Brand Voice Check**:
```typescript
// Guideline: "Use conversational, friendly tone"
// Content: "One must endeavor to optimize one's engagement metrics..."
// Finding: {
//   issue: "Overly formal tone",
//   recommendation: "Rewrite in conversational style: 'You'll want to improve your engagement metrics...'",
//   severity: "medium"
// }
```

### SEO Optimization

**Keyword Strategy**:
- Primary keyword placement (title, first paragraph, headings)
- Keyword density (1-2% target)
- Semantic keywords and variations
- Keyword stuffing detection

**Technical SEO**:
- Meta description (150-160 characters)
- Title tag optimization (<60 characters)
- Heading hierarchy (H1 → H2 → H3)
- Internal/external link balance
- Image alt text

**Content Structure**:
- Introduction with hook
- Subheadings every 300 words
- Short paragraphs (3-4 sentences)
- Bullet points and lists
- Clear call-to-action

### Readability & Accessibility

**Reading Level**:
- Flesch Reading Ease: 60-70 (general audience)
- Grade level: 8th-10th grade (business content)
- Sentence length: <25 words average
- Paragraph length: <150 words

**Engagement Elements**:
- Questions to hook readers
- Statistics and data points
- Stories and examples
- Active voice (>80% of sentences)
- Transition words

### Messaging Effectiveness

**Value Proposition**:
- Clear benefit statements
- Problem-solution framing
- Unique differentiation
- Credibility indicators (social proof, case studies)

**Call-to-Action**:
- Specific action requested
- Urgency or benefit emphasized
- Easy to find (placement)
- Action-oriented language

---

## Communication with Maestro

**Transparency Notes** (brief, factual):
- "Analyzing 12 blog posts for brand consistency..."
- "Brand consistency score: 7.8/10"
- "Completed analysis in 8.2s"

**Progress Updates** (for large content sets):
- "Analyzed 20/45 posts..."
- "Detected 8 tone inconsistencies so far..."

**Completion Report**:
```typescript
{
  summary: "12 blog posts analyzed. 8 align with brand voice, 4 need revision.",
  brand_consistency_score: 7.8,
  seo_average_score: 72,
  findings: [
    {
      post: "content/blog/marketing-automation.md",
      issue: "Tone too technical for target audience",
      evidence: "Heavy use of jargon: 'API integration', 'webhook configuration'",
      recommendation: "Simplify language or add explanatory context",
      priority: "medium"
    },
    {
      post: "content/blog/customer-retention.md",
      issue: "Missing primary keyword in H1",
      evidence: "Title is 'Keeping Your Customers Happy' but target keyword is 'customer retention strategies'",
      recommendation: "Revise title to include target keyword",
      priority: "high"
    }
  ],
  recommendations: [
    "Add brand voice examples to 4 posts that deviate from guidelines",
    "Optimize meta descriptions for 6 posts (currently too short)",
    "Improve readability in 3 posts (currently grade 13+, target: grade 10)"
  ],
  metrics: {
    average_reading_level: 10.2,
    average_word_count: 704,
    posts_with_cta: 10,
    posts_missing_cta: 2
  }
}
```

---

## Example Workflows

### Example 1: Brand Voice Audit

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Audit all blog posts for brand voice consistency",
  scope: "content/blog/*.md",
  focus: ["brand-voice", "tone", "messaging"],
  standards: ["Brand guidelines v2.0"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select brand voice analysis chain
2. **DESCRIPTION**: Configure tone detection with brand categories
3. Read files: `read-file([...all blog posts])` in parallel
   - **DISCERNMENT**: 12 files loaded ✓
4. Extract text: Clean markup, get plain text
   - **DISCERNMENT**: Text extracted from all posts ✓
5. Detect tone: Analyze each post's tone
   - **DISCERNMENT**: 8 posts "professional-friendly", 3 "too technical", 1 "too casual"
6. Compare to guidelines: Check against brand_guidelines.md
   - **DISCERNMENT**: 4 posts deviate from guidelines
7. Format report: Brand consistency findings
8. Return to Maestro: Complete audit with specific recommendations

### Example 2: SEO Optimization

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Optimize landing pages for search",
  scope: "pages/landing/*.html",
  focus: ["seo", "keywords", "readability"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select SEO optimization chain
2. **DESCRIPTION**: Configure SEO checks for landing pages
3. Read files: Load all landing pages
4. Check SEO: Analyze keywords, meta, structure
   - **DISCERNMENT**: Average SEO score 68/100
   - **DILIGENCE**: 2 pages missing meta descriptions (Level 2: Continue, flag for fix)
5. Calculate readability: Assess accessibility
   - **DISCERNMENT**: Average grade level 11.5 (target: 10)
6. Return SEO audit with prioritized recommendations

### Example 3: Content Performance Analysis

**Maestro's Strategic Direction**:
```typescript
{
  goal: "Analyze why certain blog posts perform better",
  scope: "content/blog/top-10/*.md vs content/blog/low-engagement/*.md",
  focus: ["engagement", "readability", "messaging"]
}
```

**Skill's Tactical Execution**:
1. **DELEGATION**: Select audience engagement chain
2. Read high-performing posts
3. Read low-performing posts
4. Analyze both sets for:
   - Sentiment and emotional resonance
   - Readability scores
   - Engagement hooks (questions, stories, data)
   - CTA placement and clarity
5. Compare differences
   - **DISCERNMENT**: High-performers use more questions (+40%), stories (+60%)
   - **DISCERNMENT**: Low-performers have longer paragraphs, fewer subheadings
6. Return comparative analysis with success patterns

---

## Best Practices

### DO
- Apply marketing and content strategy domain knowledge
- Compare content against brand guidelines when available
- Provide specific examples in recommendations
- Prioritize findings by impact (SEO > minor wording)
- Consider target audience in all evaluations
- Include evidence (quotes, metrics) for all findings

### DON'T
- Don't assume brand voice without guidelines
- Don't recommend changes that conflict with brand
- Don't focus only on SEO (balance with readability)
- Don't fail analysis if one piece has errors
- Don't provide generic advice (be specific to content)

---

## Integration Notes

### Called by Maestro

Maestro queries registry with natural language:
- "Analyze blog posts for brand consistency"
- "Check landing pages for SEO"
- "Review content readability"

Registry matches this skill based on capabilities: `content-analysis`, `brand-voice`, `seo-optimization`

### Delegates to Micro-Skills

- **read-file**: Load content files
- **extract-text**: Clean text from markup (HTML, Markdown)
- **detect-tone**: Analyze content tone
- **analyze-sentiment**: Measure emotional resonance
- **check-seo**: Evaluate SEO optimization
- **calculate-readability**: Compute readability metrics
- **detect-hooks**: Find engagement elements
- **format-output**: Structure analysis report

---

## Success Criteria

- ✓ Brand voice consistency accurately assessed
- ✓ SEO recommendations are actionable and prioritized
- ✓ Readability scores appropriate for target audience
- ✓ Findings include specific evidence and examples
- ✓ Analysis completes in reasonable time (<1min per 10 posts)
- ✓ Report is clear and organized by priority

---

**Skill Status**: Tier 2 Orchestrator with Marketing/Content Strategy Expertise
**Methodology**: Tactical 4-D (Delegation, Description, Discernment, Diligence)
**Model**: Sonnet (domain expertise required)
**Domain**: Marketing / Content Strategy
