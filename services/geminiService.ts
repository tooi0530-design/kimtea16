import { GoogleGenAI } from "@google/genai";
import { Todo, TaskStatus } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getDailyAdvice = async (date: string, todos: Todo[]): Promise<string> => {
  if (todos.length === 0) {
    return "오늘의 할 일이 아직 없습니다. 작은 목표부터 하나씩 세워보세요!";
  }

  const completedCount = todos.filter(t => t.status === TaskStatus.SUCCESS).length;
  const failureCount = todos.filter(t => t.status === TaskStatus.FAILURE).length;
  const pendingCount = todos.filter(t => t.status === TaskStatus.PENDING).length;

  const prompt = `
    오늘 날짜: ${date}
    할 일 목록:
    ${todos.map(t => `- ${t.text} (${t.status === TaskStatus.SUCCESS ? '성공' : t.status === TaskStatus.FAILURE ? '실패' : '진행중'})`).join('\n')}

    상황 요약: 성공 ${completedCount}건, 실패 ${failureCount}건, 남은 일 ${pendingCount}건.
    
    역할: 당신은 다정하고 재치있는 개인 비서입니다.
    요청: 위 할 일 목록 상태를 보고, 사용자에게 짧은 피드백이나 동기부여 메시지를 한국어로 1문장~2문장 정도로 작성해주세요. 
    성공이 많으면 칭찬을, 실패가 있거나 할 일이 많으면 격려를 해주세요. 이모지를 적절히 사용하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "오늘도 파이팅하세요!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI 연결에 문제가 생겼지만, 당신의 하루를 응원합니다!";
  }
};