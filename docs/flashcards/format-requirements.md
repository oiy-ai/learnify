# Flashcard Format Requirements

This document outlines the format requirements for flashcards and quiz cards in the Learnify application.

## Card Types

Learnify supports two types of cards:

1. **Flashcard** - Question and answer format
2. **Single-Choice Quiz Card** - Multiple choice question with one correct answer

## Flashcard Format

Flashcards must follow this exact structure:

```
[flashcard]
[Question]
Your question content here...
[Answer]
Your answer content here...
```

### Requirements:

- Must start with `[flashcard]` marker on the first line
- Must include `[Question]` marker followed by question content
- Must include `[Answer]` marker followed by answer content
- Markers must appear in this exact order: `[flashcard]` → `[Question]` → `[Answer]`
- Question and answer content can span multiple lines
- Empty lines between content are ignored

### Example:

```
[flashcard]
[Question]
What is the capital of France?
[Answer]
Paris is the capital of France. It has been the country's capital since 987 AD.
```

## Single-Choice Quiz Card Format

Quiz cards must follow this exact structure:

```
[single-choice]
[Question]
Your question content here...
[Options]
a) First option
b) Second option
c) Third option
d) Fourth option
[Answer]
b
```

### Requirements:

- Must start with `[single-choice]` marker on the first line
- Must include `[Question]` marker followed by question content
- Must include `[Options]` marker followed by options
- Options must be formatted as `a)`, `b)`, `c)`, or `d)` followed by the option text
- Must have at least 2 options (maximum 4 options using letters a-d)
- Must include `[Answer]` marker followed by the correct option letter (a, b, c, or d)
- Markers must appear in this exact order: `[single-choice]` → `[Question]` → `[Options]` → `[Answer]`
- The answer must be a single lowercase letter matching one of the provided options

### Example:

```
[single-choice]
[Question]
Which programming language is known for its use in web development and runs in browsers?
[Options]
a) Python
b) JavaScript
c) C++
d) Java
[Answer]
b
```
