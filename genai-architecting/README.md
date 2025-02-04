Project Architecture for Thai Language Learning AI System

1. Business Context and Goals

The project is aimed at extending the language offerings and augmenting the learning experience for students through AI-powered applications. It is designed to integrate with an existing learning portal and learning record store while supporting various Thai language learning use cases.

2. Conceptual Architecture

A high-level overview of the system’s key business objectives and AI-driven enhancements:

Develop multiple AI-powered learning applications to support Thai language education.

Maintain and enhance the learning portal using AI tools.

Ensure smooth integration with the existing learning record store.

Support scalability for future language extensions.

Conceptual Diagram Elements:

Lang Portal: Serves as the main interface for teachers and students to access study activities and word groups.

Study Activities: Includes writing practice apps, immersion games, sentence constructors, and vocabulary tools.

Database: Core 2000 Words database to provide essential vocabulary.

RAG (Retrieval-Augmented Generation): Handles query-based learning assistance with prompt caching and vector database integration.

LLM (7B Model): Processes user queries with input and output guardrails.

3. Logical Architecture

This section describes the main components, their relationships, and how they fit into the AI-driven ecosystem.

3.1 Learning Applications

Daily Life Visual Novel Generator

Generates a town simulation where users can engage in Thai language conversations.

Ensures consistency in character interactions.

Maintains chat history for multiple characters.

Thai Text Adventure

A progressive text-based game that introduces Thai vocabulary and writing structures.

Thai Sentence Constructor

Users input English phrases, and the app provides AI-guided assistance for Thai translation.

Sign to Speak (Not specific to Thai language, but part of the overall platform)

Uses AI-based webcam recognition to assist in ASL finger-spelling practice.

Subtitles to Vocabulary

Extracts Thai vocabulary from movie subtitle files using LLMs.

Operates as an offline batch process for cost efficiency.

Outputs structured JSON data with evaluated vocabulary.

Speech to Learn

Provides speech practice by presenting words for pronunciation attempts.

Requires an Automatic Speech Recognition (ASR) system.

Constraints: ASR inference must be under 1 second for MVP.

Thai Teaching Assistant

Utilizes Retrieval-Augmented Generation (RAG) to extract information from texts.

Allows users to ask questions based on extracted content.

3.2 Integration with Existing Systems

The system must seamlessly integrate with the existing learning portal and learning record store.

Core vocabulary from the database serves as foundational data for learning activities.

4. Functional Requirements

The company aims to own the infrastructure for privacy and cost control.

Planned investment in an AI PC with a budget of $10K-$15K.

Serves 300 active students located in the city of Bangkok.

5. Assumptions

Open-source LLMs will be sufficient for deployment on $10K-$15K hardware.

A single server with adequate bandwidth can support all 300 students.

6. Data Strategy

Copyright Compliance: Licensed materials must be purchased and stored in the database to avoid copyright issues.

Core Vocabulary Database: 2000 essential Thai words are integrated into learning tools.

Considerations:

IBM Granite, an open-source model with traceable training data, is under consideration for deployment.

7. Model Selection & Development

LLMs: IBM Granite or similar open-source models.

Unknowns:

Finalized selection between proprietary or open-source models.

Specific training and fine-tuning requirements for Thai language support.

8. Infrastructure Design

On-Premises Hardware: AI PC with allocated budget.

Scalable Design: Potential for cloud integration if needed in the future.

9. Integration & Deployment

APIs & Interfaces: The AI system must expose well-defined APIs for seamless interaction.

CI/CD Pipelines: To facilitate frequent updates and model improvements.

10. Monitoring & Optimization

Telemetry & Logging: Real-time logging for model performance and system health.

Feedback Loops: Continuous improvement based on user engagement data.

KPIs for Evaluation:

User retention and engagement rates.

Accuracy and efficiency of AI-driven learning suggestions.

11. Governance & Security

Access Controls: Role-based authentication for secure access.

Responsible AI Use: Implementing guidelines for ethical AI deployment.

Compliance & Regulation: Ensuring adherence to relevant education and AI policies.

12. Scalability & Future-Proofing

Containerization & Microservices: To maintain flexibility in deployment.

Version Control for Models & Data: Allowing for rollback and updates.

13. Business Considerations

Complexity: The AI system introduces multiple moving parts that require ongoing maintenance.

Cost Factors:

Model hosting and API calls.

Compute resources for inference.

Vendor Lock-In Mitigation: Ensuring modularity to switch between AI models or service providers.

14. LLM-Specific Considerations

Model Selection:

Evaluating Thai language capabilities of various LLMs.

Enhancing Context:

RAG implementation for better contextual responses.

Guardrails:

Implementing input/output filters to prevent irrelevant or harmful AI responses.

Model Access Abstraction:

Providing APIs that can switch between different LLMs based on availability and cost.

Caching Strategies:

Utilizing cache layers for frequently accessed learning content.

Agent Execution & System Integration:

Ensuring AI agents operate efficiently within the ecosystem.

Final Notes

This document reflects the updated project architecture for Thai language learning AI. Further details are required for:

Final model and infrastructure decisions.

Specific API and legacy system integration requirements.

Scalability and future-proofing measures based on extended language support.