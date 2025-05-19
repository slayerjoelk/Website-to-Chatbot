import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { supabase } from '../supabase/client';

export class Chatbot {
  private llm: OpenAI;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: SupabaseVectorStore;

  constructor(apiKey: string) {
    this.llm = new OpenAI({ 
      openAIApiKey: apiKey,
      temperature: 0.7,
      modelName: 'gpt-3.5-turbo'
    });
    this.embeddings = new OpenAIEmbeddings({ openAIApiKey: apiKey });
  }

  async initialize(chatbotId: string) {
    this.vectorStore = await SupabaseVectorStore.fromExistingIndex(
      this.embeddings,
      {
        client: supabase,
        tableName: 'documents',
        queryName: 'match_documents'
      }
    );
  }

  async addDocument(content: string, metadata: Record<string, any>) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.createDocuments([content], [metadata]);
    await this.vectorStore.addDocuments(docs);
  }

  async query(question: string): Promise<string> {
    const prompt = PromptTemplate.fromTemplate(
      `Answer the question based on the context below. If you don't know the answer, say "I don't have enough information to answer that question."

Context: {context}

Question: {question}

Answer: `
    );

    const chain = new LLMChain({ llm: this.llm, prompt });
    
    const relevantDocs = await this.vectorStore.similaritySearch(question, 3);
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    const response = await chain.call({
      context,
      question,
    });

    return response.text;
  }
}