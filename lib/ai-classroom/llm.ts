import type { ChatMessage, ChatRequest } from "./types";
import { getAgent } from "./agents";

const teacherTemplates = [
  (topic: string) => `Great question about ${topic}! Let me explain this step by step.

First, let's understand the core idea. ${topic} is about organizing and solving problems in a structured way. Think of it like building with LEGO blocks — you start with small pieces and combine them to create something complex.

Here's a simple example to illustrate:

\`\`\`
# Let's break this down with a practical example
example = ["learn", "practice", "apply"]
for step in example:
    print(f"Step: {step}")
    # Each step builds on the previous one
\`\`\`

The key points to remember are:
1. Start with the fundamentals
2. Practice with small examples
3. Gradually increase complexity

Does this make sense so far? Would you like me to go deeper into any specific aspect?`,

  (topic: string) => `Let me explain ${topic} with an analogy you can relate to.

Imagine you're learning to cook. You start with simple recipes — boiling an egg, making toast. As you get comfortable, you try harder dishes. ${topic} works the same way.

Here's a practical demonstration:

\`\`\`
# Think of this as a recipe for understanding
ingredients = ["curiosity", "patience", "practice"]
steps = [
    "Read the concept",
    "Try a simple example", 
    "Explain it to someone else"
]
for step in steps:
    print(f"✓ {step}")
\`\`\`

The beauty of this approach is that each concept builds on the last. What specific part would you like me to elaborate on?`,
];

const assistantTemplates = [
  (topic: string) => `Let me simplify ${topic} for you!

Think of it this way: ${topic} is just a way of doing something step by step. It's like following a recipe — you have inputs, a process, and an output.

Here's the simplest way to understand it:

The main ideas to focus on are:
• What problem does this solve?
• How does it work at a high level?
• Where would you use it in practice?

Don't worry about memorizing everything at once. Pick ONE small concept, understand it deeply, then move to the next. That's how real learning happens.

Want me to create a quick summary of the key points?`,

  (topic: string) => `I'll break ${topic} into smaller, easier pieces.

The first thing to understand is the **why** — why does this exist? What problem does it solve?

Once you know the why, the **how** becomes much easier.

Let me give you a quick reference:
• **Core idea**: The fundamental principle
• **Key terms**: Vocabulary you need to know
• **Common use cases**: Where you'll encounter this
• **Practice tip**: How to reinforce your understanding

Would you like me to explain any of these in more detail?`,
];

const interviewerTemplates = [
  (topic: string) => `Let's start your mock interview on ${topic}.

**Question 1:** Can you explain what ${topic} is and why it's important?

Take your time thinking about it. When you're ready, type your answer and I'll give you feedback including:
• Strengths of your answer
• Areas for improvement
• A suggested score (1-10)
• A follow-up question to deepen your response

Ready? Go ahead and answer!`,

  (topic: string) => `**Interview Question:** Describe a real-world scenario where you would apply ${topic}. What considerations would you keep in mind?

This tests both your theoretical knowledge and practical experience. Think about:
• The problem context
• Your approach
• Trade-offs you considered
• The outcome

I'll evaluate your response on clarity, depth, and practical reasoning. Start when ready.`,
];

const classmateTemplates = [
  (topic: string) => `Hey everyone! I'm trying to understand ${topic} but I'm a bit confused about where to start. Can someone explain it like I'm five? What's the most important thing to know first?`,

  (topic: string) => `I've been reading about ${topic} and I have a question. How does this actually apply in real projects? Like, when would a developer actually use this at work? I understand the theory but I want to see the practical side.`,

  (topic: string) => `Interesting topic! One thing I'm curious about — what are the common mistakes people make when learning ${topic}? I'd like to avoid those pitfalls. Also, what's the best way to practice this?`,
];

function pickTemplate(templates: ((topic: string) => string)[], topic: string): string {
  const idx = Math.floor(Math.random() * templates.length);
  return templates[idx](topic);
}

function getTeacherResponse(message: string, topic?: string): string {
  return pickTemplate(teacherTemplates, topic || message);
}

function getAssistantResponse(message: string, topic?: string): string {
  return pickTemplate(assistantTemplates, topic || message);
}

function getInterviewerResponse(message: string, topic?: string): string {
  return pickTemplate(interviewerTemplates, topic || message);
}

function getClassmateResponse(message: string, topic?: string): string {
  return pickTemplate(classmateTemplates, topic || message);
}

export async function callAI(request: ChatRequest): Promise<string> {
  const agent = getAgent(request.agentId);
  const topic = request.topic || "this topic";

  switch (agent.role) {
    case "teacher":
      return getTeacherResponse(request.message, topic);
    case "assistant":
      return getAssistantResponse(request.message, topic);
    case "interviewer":
      return getInterviewerResponse(request.message, topic);
    case "classmate":
      return getClassmateResponse(request.message, topic);
    default:
      return "I'm here to help you learn. What would you like to know?";
  }
}

export async function* streamAI(request: ChatRequest): AsyncGenerator<string> {
  const response = await callAI(request);
  const words = response.split(" ");
  for (const word of words) {
    yield word + " ";
    await new Promise((r) => setTimeout(r, 30 + Math.random() * 40));
  }
}
