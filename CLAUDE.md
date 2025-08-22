# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Senu" is a project that implements a Feature Specification Development System - a structured approach for transforming ideas into requirements, designs, and implementation plans.

## Feature Specification Development System

This project uses a three-phase structured workflow for feature development:

### Phase 1: Requirements Gathering
- Transform feature ideas into structured requirements using EARS format (Easy Approach to Requirements Syntax)
- Generate user stories and acceptance criteria
- Document: `project-specs/{feature-name}/requirements.md`

### Phase 2: Design Document  
- Create technical designs based on approved requirements
- Include architecture, components, data models, error handling, and testing strategy
- Document: `project-specs/{feature-name}/design.md`

### Phase 3: Task List
- Convert design into actionable coding tasks
- Focus exclusively on test-driven development and coding activities
- Document: `project-specs/{feature-name}/tasks.md`

### Key Workflow Rules
- Each phase requires explicit user approval before proceeding
- Use userInput tool for phase reviews with reasons: 'spec-requirements-review', 'spec-design-review', 'spec-tasks-review'
- Always read all three specification documents before executing tasks
- Execute one task at a time during implementation
- Maintain traceability from requirements through tasks

## File Structure

```
project-specs/
  {feature-name}/
    requirements.md
    design.md  
    tasks.md
specks/
  Feature Specification Development System.md
```

## Development Approach

When working on features:
1. Follow the three-phase specification process
2. Use kebab-case for feature names
3. Reference specific requirements in design and tasks
4. Focus on incremental, test-driven development
5. Maintain consistency across all specification documents