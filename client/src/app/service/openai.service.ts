import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs';
import { openaiConfigDefaults } from '../config/openai.config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface JsonSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface ResponseFormatJsonSchema {
  type: 'json_schema';
  json_schema: {
    name: string;
    schema: JsonSchema;
    strict?: boolean;
  };
}

export interface ResponseFormat {
  type: 'json_object' | 'text' | 'json_schema';
  json_schema?: {
    name: string;
    schema: JsonSchema;
    strict?: boolean;
  };
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  response_format?: ResponseFormat;
}

export interface ChatCompletionResponse {
  choices?: { message: { content: string } }[];
}

@Injectable({ providedIn: 'root' })
export class OpenAIService {
  private http = inject(HttpClient);

  baseUrl = signal(openaiConfigDefaults.baseUrl);
  model = signal(openaiConfigDefaults.model);
  apiToken = signal(openaiConfigDefaults.apiToken);

  testConnection() {
    return this.chatComplete({
      model: this.model(),
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    });
  }

  chatComplete(request: ChatCompletionRequest) {
    console.debug('[OpenAI] Request:', JSON.stringify(request, null, 2));
    return this.http
      .post<ChatCompletionResponse>(
        `${this.baseUrl()}/v1/chat/completions`,
        request,
        { headers: this.buildHeaders() },
      )
      .pipe(
        tap((response) =>
          console.debug(
            '[OpenAI] Response:',
            JSON.stringify(response, null, 2),
          ),
        ),
      );
  }

  static jsonResponseFormat(
    name: string,
    schema: JsonSchema,
    strict = true,
  ): ResponseFormatJsonSchema {
    return {
      type: 'json_schema',
      json_schema: { name, schema, strict },
    };
  }

  private buildHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (this.apiToken()) {
      headers = headers.set('Authorization', `Bearer ${this.apiToken()}`);
    }
    return headers;
  }
}
